document.addEventListener('DOMContentLoaded', function() {
    const generateAyahButton = document.querySelector('#generate-ayah');
    const ayahDisplay = document.querySelector('#ayah-display');
    const copyButton = document.querySelector('.copy');
    const speechButton = document.querySelector('.speech');
    const stopSpeechButton = document.querySelector('.speech2'); // Selector for the stop button
    let currentAudio = null; // To hold the current audio element
    let ayahLoaded = false; // To track if an Ayah has been successfully loaded

  const introArrow = document.querySelector('#intro i');
  const ayahWrapper = document.querySelector('.ayahpage');

  introArrow.addEventListener('click', function() {
    ayahWrapper.scrollIntoView({ behavior: 'smooth' });
    });
  
    generateAyahButton.addEventListener('click', function() {
        ayahLoaded = false; // Reset on new Ayah generation
        const ayahNumber = Math.floor(Math.random() * 6236) + 1;
        const textEdition = 'en.asad';
        const audioEdition = 'ar.alafasy';

        // Fetch text translation
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${textEdition}`)
            .then(response => response.json())
            .then(data => {
                if (data.code !== 200 || !data.data) {
                    throw new Error('Error in API response for text');
                }
                const ayahData = data.data;
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

        // Fetch audio recitation
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${audioEdition}`)
            .then(response => response.json())
            .then(data => {
                if (data.code !== 200 || !data.data) {
                    throw new Error('Error in API response for audio');
                }
                const audioUrl = data.data.audio;
                currentAudio = new Audio(audioUrl);
            })
            .catch(error => {
                console.error('Error fetching Ayah audio:', error);
            });
    });

    copyButton.addEventListener('click', function() {
        if (!ayahLoaded) {
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
            currentAudio.currentTime = 0; // Optionally reset the audio to the start
        }
    });
});