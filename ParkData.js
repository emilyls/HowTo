document.addEventListener('DOMContentLoaded', bindButton);

function bindButton() {
	document.getElementById('allParkData').addEventListener('click', function(event){
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				// var response = JSON.parse(request.responseText);
				// document.getElementById('allParks').innerHTML = response;
			}
		}

		request.open('Get', 'http://52.88.123.171:3000/results', true);
		request.send(null);
		event.preventDefault();
	});
}
