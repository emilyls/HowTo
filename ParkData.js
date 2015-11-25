document.addEventListener('DOMContentLoaded', bindButton);

function bindButton() {
	document.getElementById('allParkData').addEventListener('click', function(event){
		var request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				var response = JSON.parse(request.responseText);
				document.getElementById('allParks').innerHTML = response;
			}
		}

		request.open('Get', 'http://oregonstateparks.org/data/index.cfm/parks', true);
		request.send(null);
		event.preventDefault();
	});
}