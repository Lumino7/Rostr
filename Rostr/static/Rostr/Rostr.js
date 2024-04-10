let $datePickerButton;
let $table;
let $tableHead;
let $tableBody;
let $shiftModalTitle;
let $shiftModalStartTime;
let $shiftModalEndTime;
let $shiftModalOnCall;
let $shiftModalOff;
let $shiftModal;
let shiftModal;
let $shiftModalForm;
let $shiftModalDeleteButton;
let currentWeekStart;
let clickedCell;
let entries;

function getMonday(date) {
    const day = date.getDay() || 7; // Get the day of the week, with Sunday being 0 and Monday being 1
    if (day !== 1) {
        date.setDate(date.getDate() - (day - 1)); // Set the date to the Monday of the current week
    }
    return date;
}

function createShift(entryIndex, shiftIndex, data) {
    fetch('shifts', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(async (response) => {
        if (!response.ok) {
            if (response.status === 409) {
                showWarningToast('User already has a shift on this date!');
                return;
            }

            showErrorToast('Something went wrong!');
            return;
        }

        showSuccessToast('Shift created successfully!');

        const newShift = await response.json();

        entries[entryIndex].shifts[shiftIndex] = newShift;

        populateTableBody();

        shiftModal.hide();

        clickedCell = null;

        return newShift;
    });
}

function updateShift(entryIndex, shiftIndex, id, data) {
    fetch (`shifts/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(async (response) => {
        if (!response.ok) {
            showErrorToast('Something went wrong!');
            return;
        }

        showSuccessToast('Shift edited successfully!');

        const updatedShift = await response.json();

        entries[entryIndex].shifts[shiftIndex] = updatedShift;

        populateTableBody();

        shiftModal.hide();

        clickedCell = null;

        return updatedShift;
    });
}

function removeShift(entryIndex, shiftIndex, id) {
    fetch (`shifts/${id}`, {
        method: 'DELETE'
    })
    .then((response) => {
        if (!response.ok) {
            showErrorToast('Something went wrong!');
            return;
        }

        showSuccessToast('Shift deleted successfully!');

        entries[entryIndex].shifts[shiftIndex] = null;

        populateTableBody();

        shiftModal.hide();

        clickedCell = null;

        console.dir(entries);

    });
}

document.addEventListener('DOMContentLoaded', async function() {
    currentUser = await getSession();

    if (!currentUser) {
        return;
    }

    $datePickerButton = document.querySelector("#dateselector");

    let $loggedUserText = document.querySelector("#logged-user-text");
    $loggedUserText.innerText = `Logged-in as ${currentUser.username}`

    $table = document.querySelector("#sched-table");
    $tableHead = $table.querySelector("thead");
    $tableBody = $table.querySelector("tbody");
    $previousButton = document.querySelector("#previous-button");
    $nextButton = document.querySelector("#next-button");

    $shiftModal = document.querySelector("#shift-modal");
    $shiftModalTitle = $shiftModal.querySelector("#modal-title");
    $shiftModalStartTime = $shiftModal.querySelector("#start-time");
    $shiftModalEndTime = $shiftModal.querySelector("#end-time");
    $shiftModalOnCall = $shiftModal.querySelector("#on-call");
    $shiftModalOff = $shiftModal.querySelector("#off");
    $shiftModalDeleteButton = $shiftModal.querySelector("#delete-button");
    shiftModal = new bootstrap.Modal($shiftModal); //assigns $shiftModal to an instance of the JS bootstrap.Modal object, giving it JS modal controls/methods.
    $shiftModalForm = $shiftModal.querySelector("form");
    $shiftModalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const body = {};
        formData.forEach((value, key) => (body[key] = value)); //the forEach's callback function takes a value then a key. this line assigns each key value pair from formdata to body.
        delete body['csrfmiddlewaretoken']; //the token needs to be in the header, not the body.

        if (!Array.isArray(clickedCell)) {
            return;
        }

        const entryIndex = clickedCell[0];
        const shiftIndex = clickedCell[1];

        if (shiftIndex < 0 || shiftIndex > 6) {
            console.error(`invalid shift index ${shiftIndex}`);
        }

        const entry = entries[entryIndex];
        if (!entry) {
            console.error(`entry at index ${entryIndex} does not exist.`);
        }
        const shift = entry.shifts[shiftIndex] || null;


        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + shiftIndex);

        if (!shift?.id) { //optional chaining, new shifts won't have an id yet, its created in the backend
            createShift(entryIndex, shiftIndex, {
                ...body, //spread operator, all the properties of body will be copied into the new object.
                date: date,
                'user-id': entry.user.id,
            });
        } else {
            updateShift(entryIndex, shiftIndex, shift.id, body);
        }
    });

    $shiftModalDeleteButton.addEventListener('click', () => {
        if (!Array.isArray(clickedCell)) {
            return;
        }

        const entryIndex = clickedCell[0];
        const shiftIndex = clickedCell[1];

        if (shiftIndex < 0 || shiftIndex > 6) {
            console.error(`invalid shift index ${shiftIndex}`);
        }

        const entry = entries[entryIndex];
        if (!entry) {
            console.error(`entry at index ${entryIndex} does not exist.`);
        }
        const shift = entry.shifts[shiftIndex] || null;

        removeShift(entryIndex, shiftIndex, shift.id);

    });

    function getDatePickerButtonText(date) {
        const dateStr = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        return `Week of ${dateStr}`;
    }

    async function onDateChange(date) {
        currentWeekStart = date;

        $datePickerButton.innerHTML = getDatePickerButtonText(date);

        populateTableHeaders(date);

        entries = await getShifts(date);

        populateTableBody();

    }

    const initialDate = getMonday(new Date()); //getMonday of the current date

    flatpickr("#dateselector", {
        defaultDate: initialDate,
        dateFormat: "d-M-Y",
        enable: [
            function(date) {
                // return true to enable
                return (date.getDay() === 1); //only enable Mondays
            }
        ],
        enableTime: false,
        onChange: function(selectedDates, dateStr, instance) {
            onDateChange(selectedDates[0]);
        }
    });

    // Set initial date
    onDateChange(initialDate);

    $previousButton.addEventListener('click', () => {
        const previousWeekStart = new Date(currentWeekStart);
        previousWeekStart.setDate(currentWeekStart.getDate() - 7);
        onDateChange(previousWeekStart);
    })

    $nextButton.addEventListener('click', () => {
        const nextWeekStart = new Date(currentWeekStart);
        nextWeekStart.setDate(currentWeekStart.getDate() + 7);
        onDateChange(nextWeekStart);
    })
});

function getSession() {
    return fetch('me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function getShifts(weekStart) {
    var weekStartISO = weekStart.toISOString();
    const url = "shifts?start_date="+encodeURIComponent(weekStartISO) //gives the URL a start_date parameter, encodeURIComponent replaces certain characters so that it's safe to use in a URL.

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function populateTableHeaders(date) {
    $tableHead.innerHTML = ''; //clears it

    let $tr = document.createElement('tr');

    let $th = document.createElement('th');
    $th.innerHTML = 'Name';
    $tr.appendChild($th);

    for (var i = 0; i < 7; i++) {
        var currentDate = new Date(date);

        currentDate.setDate(date.getDate() + i);

        var formattedDate = currentDate.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });


        let $th = document.createElement('th');
        $th.innerHTML = formattedDate;
        $tr.appendChild($th);
    }

    $tableHead.appendChild($tr);
}

function getShiftString(shift) {
    if (!shift) {
        return '';
    }

    if (shift['is-off']) {
       return 'Off';
    }

    const onCallStr = shift['is-oncall'] ? '\n[On-Call]' : '';

    return `${shift.start.substring(0,5)} - ${shift.end.substring(0,5)}${onCallStr}`;
}

function toggleFields() {
    const $start = $shiftModalForm.querySelector("input[name='start']");
    const $end = $shiftModalForm.querySelector("input[name='end']");
    const $onCall = $shiftModalForm.querySelector("input[name='is_oncall']");
    const $off = $shiftModalForm.querySelector("input[name='is_off']");

    $start.disabled = $off.checked;

    if ($off.checked) {
        $start.value = '';
    }

    $end.disabled = $off.checked;

    if ($off.checked) {
        $end.value = '';
    }

    $onCall.disabled = $off.checked;

    if ($off.checked) {
        $onCall.checked = false;
    }
}

function populateTableBody() {
    $tableBody.innerHTML = ""; //clears it

    entries.forEach(function(entry, indexA) { //each entry is an object
        const {user,shifts} = entry; //destructuring
        let $row = document.createElement('tr');
        if (currentUser.id == user.id) {
            $row.classList.add("table-info"); //highlights user's roster.
        }
        $tableBody.appendChild($row);

        let name = document.createElement('td');
        name.innerHTML = `${user.last_name}, ${user.first_name}`;
        $row.appendChild(name);

        shifts.forEach(function(shift, indexB) {
            var currentDate = new Date(currentWeekStart);

            currentDate.setDate(currentWeekStart.getDate() + indexB);

            let $cell = document.createElement('td');
            $cell.classList.add('shift')

            let $span = document.createElement('span');
            $span.innerHTML = getShiftString(shift);
            $cell.appendChild($span);

            if (currentUser.is_admin) {
                let $button = document.createElement('button');
                $button.id = `cell${indexA}-${indexB}`

                $button.addEventListener("click", () => {
                    clickedCell = [indexA, indexB];

                    populateModal();
                });

                $cell.appendChild($button);
            }

            $row.appendChild($cell);
        });
    });
}

function populateModal() {
    const $start = $shiftModalForm.querySelector("input[name='start']");
    const $end = $shiftModalForm.querySelector("input[name='end']");
    const $onCall = $shiftModalForm.querySelector("input[name='is_oncall']");
    const $off = $shiftModalForm.querySelector("input[name='is_off']");

    if (!Array.isArray(clickedCell)) {
        return;
    }

    const entryIndex = clickedCell[0];
    const shiftIndex = clickedCell[1];

    if (shiftIndex < 0 || shiftIndex > 6) {
        console.error(`invalid shift index ${shiftIndex}`);
    }

    const currentDate = new Date(currentWeekStart);

    currentDate.setDate(currentWeekStart.getDate() + shiftIndex);

    const entry = entries[entryIndex];
    if (!entry) {
        console.error(`entry at index ${entryIndex} does not exist.`);
    }
    const shift = entry.shifts[shiftIndex] || null;

    $off.addEventListener('change', () => {
        toggleFields();
    });


    //set modal title
    if (!shift) {
        $shiftModalTitle.innerHTML = "Create Shift";
        $shiftModalDeleteButton.style.display = "none";
    } else {
        $shiftModalTitle.innerHTML = "Edit Shift";
        $shiftModalDeleteButton.style.display = "block";

    }

    let $modalDate = document.createElement('h6');
    $modalDate.innerHTML = currentDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    $shiftModalTitle.appendChild($modalDate);

    //set modal input values
    if (shift) {
        $start.value = shift.start;
        $end.value = shift.end;
        $onCall.checked = shift['is-oncall'];
        $off.checked = shift['is-off'];
    } else {
        $start.value = '';
        $end.value = '';
        $onCall.checked = false;
        $off.checked = false;
    }

    toggleFields();

    shiftModal.show();

}

function showErrorToast(message) {
    showToast(message, undefined, 'danger');
}

function showSuccessToast(message) {
    showToast(message, undefined, 'success');
}

function showWarningToast(message) {
    showToast(message, undefined, 'warning');
}

function showToast(message, _delay, _type) {
    const delay = _delay || 3000;
    const type = _type || 'success';

    const $toast = document.createElement('div');
    $toast.classList.add('toast', 'align-items-center', 'text-white', 'bg-' + type, 'border-0');
    $toast.setAttribute('role', 'alert');
    $toast.setAttribute('aria-live', 'assertive');
    $toast.setAttribute('aria-atomic', 'true');

    $toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.getElementById('toast-container').appendChild($toast);

    var toast = new bootstrap.Toast($toast);

    toast.show();

    setTimeout(function() {
      toast.hide();
    }, delay);
  }
