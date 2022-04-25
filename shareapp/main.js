/**
 * AUTHOR: Bashier Elbashier
 * DATE: 23/04/2022
 */

// List of people who contribute to the share.
// If a new person is added, add them to the list.
// If one is removed, remove them from the list.
const people = [
	{id: 1, name: 'Bashier Elbashier'},
	{id: 2, name: 'Ali Elias'},
	{id: 3, name: 'Amar Ali'},
	{id: 4, name: 'Abdallah Salih'},
	{id: 5, name: 'Murtada'},
	{id: 6, name: 'Tarig Adam'},
	{id: 7, name: 'Raheem Adam'},
	{id: 8, name: 'Hassan Abdallah'},
	{id: 9, name: 'Ahmed Osama'},
];


// Display a checkbox for every person in the people's list.
// The checkbox indicates the inclusion of the person in the share calculation.
people.forEach(function(person){
	var person_html = `<div class="form-check">
	<input class="form-check-input" type="checkbox" value="${person.id}" id="${person.id}" checked>
	<label class="form-check-label" for="${person.id}">
	${person.name}
	</label>
	</div>`;

	document.getElementById("included_people").innerHTML += person_html;
	
	person_html = `<option value="${person.id}">${person.name}</option>`;
	
	document.getElementById("paid_by").innerHTML += person_html;
});

// List containing paid shares which will be divided by people.
var paid_share_list = [];

// Variable to store last share sequence #
var last_sequence = 1;

// Add form listener. All logic is handled in the function.
document.getElementById("add_share_form").addEventListener('submit', function(ev){
	// Prevent form from submitting
	ev.preventDefault();

	// Get form values
	var paid_for = document.getElementById("paid_for").value;
	var paid_amount = parseInt(document.getElementById("paid_amount").value);
	var paid_by = parseInt(document.getElementById("paid_by").value);
	var paid_by_obj = people.find(function(person, index) {
		return person.id == paid_by;
	});

	// Construct share entry
	var share_entry = {
		id: last_sequence,
		paid_by: paid_by,
		paid_by_str: paid_by_obj.name,
		paid_amount: paid_amount,
		paid_for: paid_for,
		exempted: [],
		exempted_str: []
	};

	// Get all checkboxes which represent people
	const checkboxes = document.querySelectorAll('input[type="checkbox"]');
	
	// Get exempted (unchecked) checkboxes
	var unchecked = [].filter.call(checkboxes, function( el ) {
		return !el.checked;
	});
	var not_selected = Array.from(unchecked).map(x => parseInt(x.value));

	// Add them to the share entry
	var exempted_ids = [];
	var exempted_str = [];
	not_selected.forEach(function(nsp){
		var exempted = people.find(function(person, index) {
			return person.id == nsp;
		});
		exempted_str.push(exempted.name);
		exempted_ids.push(exempted.id);
	});
	share_entry.exempted_str = exempted_str;
	share_entry.exempted = exempted_ids;

	// Add share entry to share list
	paid_share_list.push(share_entry);
	
	// Increase share sequence		
	last_sequence ++;

	// Reset share form
	document.getElementById("add_share_form").reset();

	// Add share entry to share table
	document.getElementById("paid_share_table").innerHTML += `<tr>
		<td>${paid_share_list.length}</td>
		<td>${share_entry.paid_by_str}</td>
		<td>${share_entry.paid_for}</td>
		<td>${share_entry.exempted_str}</td>
		<td>${share_entry.paid_amount} SAR</td>
	</tr>`;

	// Calculate total amount
	calculateTotal();
});


// Function to calculate total amount
function calculateTotal(){
	let total_amount = 0.0;
	paid_share_list.forEach(function(share){
		total_amount += share.paid_amount;
	});
	document.getElementById("total_amount_cell").innerHTML = total_amount + ' SAR';
}


// Add calculate button listener
document.getElementById("calculate_share").addEventListener('click', function(ev){
	calculateAndDisplayShare();
});

// Calculate share and display table
function calculateAndDisplayShare(){
	if (paid_share_list.length > 0 && people.length > 0){
		document.getElementById("share_calculator_main_view").innerHTML = "";
		var share_table_html = `
		    <br />
			<button class="btn btn-warning btn-lg col-12" onClick="window.location.reload();">RESET</button>
			<br />
			<hr />
			<br />
			<u><h1 class="text-center">Share Table</h1></u>
			<table class="table table-striped">
				<thead>
					<tr>
						<th scope="col">#</th>
						<th scope="col">Name</th>
						<th scope="col">Debit</th>
						<th scope="col">Credit</th>
						<th scope="col">Balance</th>
					</tr>
				</thead>
				<tbody>`;
		var share_data = [];
		people.forEach(function(person){
			
			var paid_amount = 0.0;
			paid_share_list.forEach(function(share){
				if (share.paid_by == person.id)
					paid_amount += share.paid_amount;
			});
			
			var due_amount = 0.0;
			paid_share_list.forEach(function(share){
				if (share.exempted === undefined){
					due_amount += (share.paid_amount / people.length);
				} else {
					if(!share.exempted.includes(person.id)){
						due_amount += (share.paid_amount / (people.length - share.exempted.length));
					}
				}
			});

			share_data.push({
				person_name: person.name,
				paid_amount: paid_amount.toFixed(2),
				due_amount: due_amount.toFixed(2),
				balance: (due_amount - paid_amount).toFixed(2)
			});

		});
		var counter = 1;
		share_data.forEach(function(share){
			share_table_html += `
				<tr>
					<th scope="col">${counter}</th>
					<th scope="col">${share.person_name}</th>
					<th scope="col">${share.due_amount}</th>
					<th scope="col">${share.paid_amount}</th>
					<th scope="col">${share.balance}</th>
				</tr>`;
			counter ++;
		});
		share_table_html += `</tbody></table>`;
		document.getElementById("share_calculator_main_view").innerHTML = share_table_html;
	}
}
