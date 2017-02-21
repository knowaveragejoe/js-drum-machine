const DrumKit = function() {
    //Codes we care about
    var self = this;
    self.codes = [65,83,68,70,71,72,74,75,76];
    self.soundNameDisplay = null;
    self.currentSound = null;
    self.playing = false;
    self.analyser = null;

    self.findSound = function(code) {
        let sound = document.querySelector(`audio[data-key="${code}"]`);
        if (sound) {
            return sound;
        }
        return;
    };

    self.findPad = function(code) {
        let pad = document.querySelector(`.pad[data-key="${code}"]`);
        if (pad) {
            return pad;
        }
        return;
    };

    self.removeTransition = function(e) {
        if (e.propertyName !== 'box-shadow') return;
        e.target.classList.remove('pressed');
    };

    self.keyPressed = function(e) {
        let keyCode = e.keyCode;

        if (self.codes.indexOf(keyCode) < 0) {
            return; //not a key we care about
        }

        let sound = self.findSound(e.keyCode);
        let pad = self.findPad(e.keyCode);

        //rewind and play sound
        if (sound) {
            self.currentSound = sound;
            self.analyser = self.setUpAnalayser();
            self.currentSound.currentTime = 0;
            self.currentSound.play();

            //Visualize if possible
            if (self.analyser) {
                var frequencyData = new Uint8Array(self.analyser.frequencyBinCount);
                analyser.getByteFrequencyData(frequencyData);
                console.log(frequencyData);
            }
        }

        //highlight pad
        if (pad) {
            pad.classList.add('pressed');
            self.soundNameDisplay.innerHTML = pad.getAttribute('data-soundname');
        }
    };

    self.stoppedPlaying = function(e) {
        console.log("Ended fired!");
        console.log(e);
    };

    self.setUpAnalayser = function() {
        var audioCtx = new AudioContext();
        var audioElement = self.currentSound;
        var audioSrc = audioCtx.createMediaElementSource(audioElement);
        var analyser = audioCtx.createAnalyser();

        audioSrc.connect(analyser);
        audioSrc.connect(audioCtx.destination);

        return analyser;
    };

    self.init = function() {
        self.soundNameDisplay = document.querySelector('#soundName');

        //Attach keypress listener
        window.addEventListener('keydown', self.keyPressed);

        //Attach listener for css transitions
        const pads = Array.from(document.querySelectorAll('.pad'));
        pads.forEach(pad => pad.addEventListener('transitionend', self.removeTransition));

        //Attach stopped playing listeners to each audio element
        const sounds = Array.from(document.querySelectorAll('audio'));
        sounds.forEach(sound => sound.addEventListener('ended', self.stoppedPlaying));
    };

    self.init();
};

var drumkit = new DrumKit();