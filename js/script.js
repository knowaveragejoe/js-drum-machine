const DrumKit = function() {
    //Codes we care about
    var self = this;
    self.codes = [65,83,68,70,71,72,74,75,76];
    self.playing = false;
    self.analyser, self.audioSrc, self.soundNameDisplay, self.currentSound, self.frequencyData = null;
    self.audioContexts = {}, self.analysers = {};

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

    self.resetWave = function() {
        self.wave.style.padding = 0;
    };

    self.clearSoundDisplay = function() {
        self.soundNameDisplay.innerHTML = '';
    };

    self.getAnalyser = function(code) {
        if (self.analysers.code) {
            return self.analysers.code;
        }

        return null;
    };

    self.renderFrame = function() {
        self.analyser.getByteFrequencyData(self.frequencyData);

        for (var i=0;i<self.frequencyData.length;i++) {
            self.wave.style.padding = (self.frequencyData[1] * 2) + "px";
        }

        if (self.playing) {
            window.requestAnimationFrame(self.renderFrame);
        } else {
            self.resetWave();
        }
    };

    self.keyPressed = function(e) {
        self.resetWave();
        self.clearSoundDisplay();
        let keyCode = e.keyCode;

        if (self.codes.indexOf(keyCode) < 0) {
            return; //not a key we care about
        }

        let sound = self.findSound(e.keyCode);
        let pad = self.findPad(e.keyCode);

        //highlight pad
        if (!pad) {
            return;
        }

        pad.classList.add('pressed');
        self.soundNameDisplay.innerHTML = pad.getAttribute('data-soundname');

        //rewind and play sound
        if (!sound) {
            return;
        }

        self.currentSound = sound;
        // self.setUpAnalayser(keyCode);
        self.currentSound.currentTime = 0;
        self.currentSound.play();
        self.playing = true;

        //Visualize if possible
        if (!self.analyser) {
            return;
        }

        self.frequencyData = new Uint8Array(self.analyser.frequencyBinCount);
        self.renderFrame();
    };

    self.setUpAnalayser = function(code) {
        //create new audio context?
        if (!self.audioCtx) {
            self.audioCtx = new AudioContext();
        }

        var analyser = self.audioCtx.createAnalyser();
        self.analyser = analyser;
    };

    self.ended = function(e) {
        self.playing = false;
        self.resetWave();
        self.clearSoundDisplay();
    }

    self.init = function() {
        self.soundNameDisplay = document.getElementById('soundName');
        self.wave = document.getElementById('wave');

        //Attach keypress listener
        window.addEventListener('keydown', self.keyPressed);

        //Attach listener for css transitions
        const pads = Array.from(document.querySelectorAll('.pad'));
        pads.forEach(pad => pad.addEventListener('transitionend', self.removeTransition));

        self.setUpAnalayser();

        //Attach stopped playing listeners to each audio element
        //Set up analysers for each sound
        const sounds = Array.from(document.querySelectorAll('audio'));
        sounds.forEach(sound => {
            sound.addEventListener('ended', self.ended);

            var audioSrc = self.audioCtx.createMediaElementSource(sound);
            audioSrc.connect(self.analyser);
            audioSrc.connect(self.audioCtx.destination);
        });
    };

    self.init();
};

document.addEventListener('DOMContentLoaded', function(e) {
    var drumkit = new DrumKit();
});