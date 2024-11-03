document.addEventListener('DOMContentLoaded', function() {
    const generateAyahButton = document.querySelector('#generate-ayah');
    const ayahDisplay = document.querySelector('#ayah-display');
    const copyButton = document.querySelector('.copy');
    const speechButton = document.querySelector('.speech');
    const stopSpeechButton = document.querySelector('.speech2');
    const clearButton = document.querySelector('.clear');
    let currentAudio = null; // This holds the current audio object
    let ayahLoaded = false; // This checks if an Ayah is loaded

    // Scrolls to the Ayah section smoothly when the intro arrow is clicked
    // const introArrow = document.querySelector('#intro i');
    // const ayahWrapper = document.querySelector('.ayah-page');
    // introArrow.addEventListener('click', function() {
    //     ayahWrapper.scrollIntoView({ behavior: 'smooth' });
    // });

    // Generates a random Ayah and displays it
    generateAyahButton.addEventListener('click', function() {
        ayahLoaded = false; // Resets the Ayah loaded flag

        // Pauses and resets any ongoing audio before generating a new Ayah
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;  // Reset currentAudio after pausing
        }

        // Generate a random Ayah number between 1 and 6236
        const ayahNumber = Math.floor(Math.random() * 6236) + 1;
        const textEdition = 'en.asad'; // Text translation edition
        const audioEdition = 'ar.alafasy'; // Audio recitation edition

        // Fetch both Ayah text and audio concurrently
        Promise.all([
            // Fetch the text translation of the Ayah
            fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${textEdition}`)
                .then(response => response.json())
                .then(data => {
                    if (data.code !== 200 || !data.data) {
                        throw new Error('Error in API response for text');
                    }
                    const ayahData = data.data;
                    // Display the fetched Ayah details
                    ayahDisplay.innerHTML = `
                        <h1>${ayahData.surah.englishName}: ${ayahData.surah.englishNameTranslation}</h1>
                        <h2>Surah ${ayahData.surah.number} Verse ${ayahData.numberInSurah}</h2>
                        <p>${ayahData.text}</p>
                    `;
                }),
            // Fetch the audio recitation of the Ayah
            fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${audioEdition}`)
                .then(response => response.json())
                .then(data => {
                    if (data.code !== 200 || !data.data) {
                        throw new Error('Error in API response for audio');
                    }
                    const audioUrl = data.data.audio;
                    currentAudio = new Audio(audioUrl); // Create a new audio object
                })
        ]).then(() => {
            ayahLoaded = true;  // Only set to true after both requests succeed
        }).catch(error => {
            console.error('Error fetching Ayah text or audio:', error);
            ayahDisplay.innerHTML = `<p>Failed to load Ayah. Please try again.</p><p>Error: ${error.message}</p>`;
            Swal.fire({
                title: 'Error!',
                text: 'Failed to load Ayah text or audio. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        });
    });

    // Copies the Ayah text to the clipboard
    copyButton.addEventListener('click', function() {
        if (!ayahLoaded) {
            Swal.fire({
                title: 'No Ayah Loaded!',
                text: 'Please generate an Ayah first.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else if (navigator.clipboard) { // Clipboard API is available in a secure context
            const textToCopy = ayahDisplay.textContent || "Nothing to copy!";
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    Swal.fire({
                        title: 'Copied!',
                        text: 'Ayah copied to clipboard.',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                })
                .catch(err => {
                    console.error('Failed to copy!', err);
                });
        } else {
            console.error('Clipboard API not available or not in a secure context.');
        }
    });

    // Plays the Ayah audio if available
    speechButton.addEventListener('click', function() {
        if (!ayahLoaded) {
            Swal.fire({
                title: 'No Recitation!',
                text: 'Please generate an Ayah first.',
                icon: 'info',
                confirmButtonText: 'OK'
            });
        } else if (currentAudio && currentAudio.paused) { // Play only if audio is paused
            currentAudio.play()
                .catch(error => {
                    console.error('Playback failed due to auto-play restrictions:', error);
                    Swal.fire({
                        title: 'Playback Error',
                        text: 'Auto-play is restricted. Please interact with the page before playing audio.',
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                });
        }
    });

    // Stops the Ayah audio playback
    stopSpeechButton.addEventListener('click', function() {
        if (currentAudio) {
            currentAudio.pause(); // Pause the audio
            currentAudio.currentTime = 0; // Reset the audio to the start
        }
    });

    // Clears the displayed Ayah and resets the state
    clearButton.addEventListener('click', function() {
        ayahDisplay.innerHTML = ''; // Clear the display
        ayahLoaded = false; // Reset Ayah loaded flag
        if (currentAudio) {
            currentAudio.pause(); // Pause the audio
            currentAudio.currentTime = 0; // Reset the audio to the start
            currentAudio = null; // Clear the current audio reference
        }
    });

    // Log messages for debugging
    // console.log('Script loaded!');
    // console.log('Ayah loaded:', ayahLoaded);
    // console.log('Ayah text:', ayahDisplay.textContent);
    // console.log('Ayah audio:', currentAudio);
    // console.log('Ayah audio paused:', currentAudio && currentAudio.paused);
});
