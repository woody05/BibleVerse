document.addEventListener('input',  (event) => {
    // handle input event for searching for verses
    if(event.target.id === "bibleVerseSearch") {
        let input = event.target;
        const searchValue = input.value.toLowerCase();
        let verses = document.querySelectorAll('.verse-card');
        verses.forEach(verse => {
            const verseText = verse.textContent.toLowerCase();
            if (verseText.includes(searchValue)) {
                verse.style.display = '';
            } else {
                verse.style.display = 'none';
            }
        });
    }
});