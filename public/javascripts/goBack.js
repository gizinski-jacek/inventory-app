const backBtn = document.getElementById('goBack');

if (backBtn) {
	backBtn.addEventListener('click', () => {
		history.back();
	});
}
