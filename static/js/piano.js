document.addEventListener('DOMContentLoaded', function() {
    const pianoElement = document.getElementById('piano');
    const octavesSelect = document.getElementById('octaves');
    const volumeControl = document.getElementById('volume');
    const instrumentSelect = document.getElementById('instrument');
    const recordButton = document.getElementById('recordButton');
    const playButton = document.getElementById('playButton');
    const shortcutsContainer = document.getElementById('shortcuts');
    
    // Audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    
    // Piano configuration
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keyboardMap = {
        'a': 'C',
        'w': 'C#',
        's': 'D',
        'e': 'D#',
        'd': 'E',
        'f': 'F',
        't': 'F#',
        'g': 'G',
        'y': 'G#',
        'h': 'A',
        'u': 'A#',
        'j': 'B',
        'k': 'C2',
        'o': 'C#2',
        'l': 'D2',
        'p': 'D#2',
        ';': 'E2',
        '\'': 'F2'
    };
    
    // Recording state
    let isRecording = false;
    let recordedNotes = [];
    let recordStartTime = 0;
    
    // Current state
    let currentOctaves = parseInt(octavesSelect.value);
    let currentVolume = parseFloat(volumeControl.value);
    let currentInstrument = instrumentSelect.value;
    
    // Initialize piano
    createPiano();
    createShortcutsGuide();
    
    // Event listeners
    octavesSelect.addEventListener('change', function() {
        currentOctaves = parseInt(this.value);
        createPiano();
        createShortcutsGuide();
    });
    
    volumeControl.addEventListener('input', function() {
        currentVolume = parseFloat(this.value);
    });
    
    instrumentSelect.addEventListener('change', function() {
        currentInstrument = this.value;
    });
    
    recordButton.addEventListener('click', toggleRecording);
    playButton.addEventListener('click', playRecording);
    
    window.addEventListener('keydown', function(e) {
        if (e.repeat) return;
        
        const key = e.key.toLowerCase();
        if (keyboardMap[key]) {
            const note = keyboardMap[key];
            const keyElement = document.querySelector(`.piano-key[data-note="${note}"]`);
            if (keyElement) {
                playNote(note);
                keyElement.classList.add('active');
                
                if (isRecording) {
                    recordNote(note, 'down');
                }
            }
        }
    });
    
    window.addEventListener('keyup', function(e) {
        const key = e.key.toLowerCase();
        if (keyboardMap[key]) {
            const note = keyboardMap[key];
            const keyElement = document.querySelector(`.piano-key[data-note="${note}"]`);
            if (keyElement) {
                keyElement.classList.remove('active');
                
                if (isRecording) {
                    recordNote(note, 'up');
                }
            }
        }
    });
    
    function createPiano() {
        pianoElement.innerHTML = '';
        
        for (let octave = 1; octave <= currentOctaves; octave++) {
            const octaveElement = document.createElement('div');
            octaveElement.className = 'octave';
            
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                const isSharp = note.includes('#');
                const fullNote = octave > 1 ? `${note}${octave}` : note;
                
                const keyElement = document.createElement('div');
                keyElement.className = `piano-key ${isSharp ? 'black' : 'white'}`;
                keyElement.dataset.note = fullNote;
                
                if (!isSharp) {
                    keyElement.innerHTML = `<span>${note}</span>`;
                }
                
                keyElement.addEventListener('mousedown', function() {
                    playNote(fullNote);
                    this.classList.add('active');
                    
                    if (isRecording) {
                        recordNote(fullNote, 'down');
                    }
                });
                
                keyElement.addEventListener('mouseup', function() {
                    this.classList.remove('active');
                    
                    if (isRecording) {
                        recordNote(fullNote, 'up');
                    }
                });
                
                keyElement.addEventListener('mouseleave', function() {
                    this.classList.remove('active');
                });
                
                octaveElement.appendChild(keyElement);
            }
            
            pianoElement.appendChild(octaveElement);
        }
    }
    
    function createShortcutsGuide() {
        shortcutsContainer.innerHTML = '';
        
        const keysPerOctave = 12;
        const maxKeys = Math.min(Object.keys(keyboardMap).length, currentOctaves * keysPerOctave);
        
        for (let i = 0; i < maxKeys; i++) {
            const keyboardKey = Object.keys(keyboardMap)[i];
            const note = Object.values(keyboardMap)[i];
            
            if (keyboardKey && note) {
                const shortcutElement = document.createElement('div');
                shortcutElement.className = 'shortcut';
                shortcutElement.innerHTML = `
                    <span class="keyboard-key">${keyboardKey.toUpperCase()}</span>
                    <span class="note-name">${note}</span>
                `;
                
                shortcutsContainer.appendChild(shortcutElement);
            }
        }
    }
    
    function playNote(note) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Set frequency based on note
        const baseFrequency = getFrequency(note);
        oscillator.frequency.value = baseFrequency;
        
        // Set waveform based on instrument
        switch (currentInstrument) {
            case 'piano':
                oscillator.type = 'triangle';
                break;
            case 'organ':
                oscillator.type = 'sine';
                break;
            case 'acoustic':
                oscillator.type = 'sawtooth';
                break;
            case 'edm':
                oscillator.type = 'square';
                break;
            default:
                oscillator.type = 'triangle';
        }
        
        // Set volume
        gainNode.gain.value = currentVolume;
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play note
        oscillator.start();
        
        // Add slight decay
        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 1.5
        );
        
        // Stop after decay
        oscillator.stop(audioContext.currentTime + 1.5);
    }
    
    function getFrequency(note) {
        // Extract note name and octave
        const noteName = note.replace(/[0-9]/g, '');
        const octave = note.match(/[0-9]/) ? parseInt(note.match(/[0-9]/)[0]) : 4;
        
        // Base frequencies for A4 = 440Hz
        const baseFrequency = 440;
        
        // Semitones from A4
        const noteIndex = notes.indexOf(noteName);
        const a4Index = notes.indexOf('A');
        
        let semitones = (octave - 4) * 12 + (noteIndex - a4Index);
        
        // Calculate frequency using equal temperament formula
        return baseFrequency * Math.pow(2, semitones / 12);
    }
    
    function toggleRecording() {
        isRecording = !isRecording;
        
        if (isRecording) {
            // Start recording
            recordButton.innerHTML = '<i class="fas fa-stop"></i> Stop';
            recordButton.classList.add('recording');
            playButton.disabled = true;
            recordedNotes = [];
            recordStartTime = Date.now();
        } else {
            // Stop recording
            recordButton.innerHTML = '<i class="fas fa-circle"></i> Record';
            recordButton.classList.remove('recording');
            playButton.disabled = false;
        }
    }
    
    function recordNote(note, action) {
        const time = Date.now() - recordStartTime;
        recordedNotes.push({
            note: note,
            action: action,
            time: time
        });
    }
    
    function playRecording() {
        if (recordedNotes.length === 0) return;
        
        playButton.disabled = true;
        recordButton.disabled = true;
        
        let playbackStartTime = Date.now();
        
        // Process each recorded note
        recordedNotes.forEach(recordedNote => {
            setTimeout(() => {
                if (recordedNote.action === 'down') {
                    playNote(recordedNote.note);
                    
                    const keyElement = document.querySelector(`.piano-key[data-note="${recordedNote.note}"]`);
                    if (keyElement) {
                        keyElement.classList.add('active');
                        
                        // Find the corresponding 'up' action to remove the active class
                        const upAction = recordedNotes.find(n => 
                            n.note === recordedNote.note && 
                            n.action === 'up' && 
                            n.time > recordedNote.time
                        );
                        
                        if (upAction) {
                            setTimeout(() => {
                                keyElement.classList.remove('active');
                            }, upAction.time - recordedNote.time);
                        } else {
                            // If no 'up' action found, remove active class after a default time
                            setTimeout(() => {
                                keyElement.classList.remove('active');
                            }, 300);
                        }
                    }
                }
            }, recordedNote.time);
        });
        
        // Calculate total playback time
        const lastNoteTime = Math.max(...recordedNotes.map(note => note.time));
        
        // Re-enable buttons after playback
        setTimeout(() => {
            playButton.disabled = false;
            recordButton.disabled = false;
        }, lastNoteTime + 500);
    }
});