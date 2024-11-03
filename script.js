// this waits for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', function() {
    const generateAyahButton = document.querySelector('#generate-ayah');
    const ayahDisplay = document.querySelector('#ayah-display');
    const copyButton = document.querySelector('.copy');
    const speechButton = document.querySelector('.speech');
    const stopSpeechButton = document.querySelector('.speech2');
    let currentAudio = null; // This holds the current audio object
    let ayahLoaded = false; // This checks if an Ayah is loaded

    // This scrolls to the Ayah section smoothly when the arrow is clicked
    const introArrow = document.querySelector('#intro i');
    const ayahWrapper = document.querySelector('.ayah-page');
    introArrow.addEventListener('click', function() {
        ayahWrapper.scrollIntoView({ behavior: 'smooth' });
    });

    generateAyahButton.addEventListener('click', function() {
        ayahLoaded = false; // This resets the Ayah loaded flag
        // If there is an ongoing audio, this pauses and resets it
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        // Generate a random Ayah number between 1 and 6236
        const ayahNumber = Math.floor(Math.random() * 6236) + 1;
        const textEdition = 'en.asad'; // Text translation edition
        const audioEdition = 'ar.alafasy'; // Audio recitation edition

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
                ayahLoaded = true; // Set true as Ayah has been loaded successfully
            })
            .catch(error => {
                console.error('Error fetching Ayah text:', error);
                ayahDisplay.innerHTML = `<p>Failed to load Ayah text. Please try again.</p><p>Error: ${error.message}</p>`;
            });

        // Fetch the audio recitation of the Ayah
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${audioEdition}`)
            .then(response => response.json())
            .then(data => {
                if (data.code !== 200 || !data.data) {
                    throw new Error('Error in API response for audio');
                }
                const audioUrl = data.data.audio;
                currentAudio = new Audio(audioUrl); // This creates a new audio object
            })
            .catch(error => {
                console.error('Error fetching Ayah audio:', error);
            });
    });

    copyButton.addEventListener('click', function() {
        if (!ayahLoaded) {
            // this shows an alert if no Ayah is loaded
            Swal.fire({
                title: 'No Ayah Loaded!',
                text: 'Please generate an Ayah first.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
        } else if (navigator.clipboard && window.isSecureContext) {
            const textToCopy = ayahDisplay.textContent || "Nothing to copy!";
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // this shows success alert if text is copied
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

    speechButton.addEventListener('click', function() {
        if (!ayahLoaded) {
            // this shows an alert if no Ayah is loaded
            Swal.fire({
                title: 'No Recitation!',
                text: 'Please generate an Ayah first.',
                icon: 'info',
                confirmButtonText: 'OK'
            });
        } else if (currentAudio) {
            currentAudio.play()
                .catch(error => {
                    console.error('Error playing the audio:', error);
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to play Ayah recitation.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        }
    });

    stopSpeechButton.addEventListener('click', function() {
        if (currentAudio) {
            currentAudio.pause(); // Pause the audio
            currentAudio.currentTime = 0; // Reset the audio to the start
        }
    });
});
