// One instance (audioController, created in main.js) persists across scenes.
// Owns which music track should be playing and the single mute state.
Crafty.c("AudioController", {
    init: function() {
        this.requires("Persist");
        this.music = null;
        this.musicVolume = MUSIC_VOLUME;
        if (START_MUTED) {
            Crafty.audio.mute();
        }
        // Browsers block audio until the player interacts with the page,
        // so requested music waits for the first click or key press.
        this.unlocked = false;
        var unlock = function () {
            this.unlocked = true;
            this.startMusic();
            document.removeEventListener("pointerdown", unlock);
            document.removeEventListener("keydown", unlock);
        }.bind(this);
        document.addEventListener("pointerdown", unlock);
        document.addEventListener("keydown", unlock);
    },

    // Safe to call from every scene: keeps playing if it's already this track.
    playMusic: function(trackName, volume) {
        if (this.music && this.music !== trackName) {
            Crafty.audio.stop(this.music);
        }
        this.music = trackName;
        this.musicVolume = volume === undefined ? MUSIC_VOLUME : volume;
        this.startMusic();
        return this;
    },

    stopMusic: function() {
        if (this.music) {
            Crafty.audio.stop(this.music);
        }
        this.music = null;
        return this;
    },

    startMusic: function() {
        if (!this.unlocked || !this.isLoaded(this.music) || Crafty.audio.isPlaying(this.music)) {
            return;
        }
        Crafty.audio.play(this.music, -1, this.musicVolume);
    },

    playSfx: function(trackName, volume) {
        if (this.unlocked && this.isLoaded(trackName)) {
            Crafty.audio.play(trackName, 1, volume === undefined ? 1 : volume);
        }
        return this;
    },

    // A sound effect that repeats until stopSfx (e.g. wedging while the button is held).
    loopSfx: function(trackName, volume) {
        if (this.unlocked && this.isLoaded(trackName) && !Crafty.audio.isPlaying(trackName)) {
            Crafty.audio.play(trackName, -1, volume === undefined ? 1 : volume);
        }
        return this;
    },

    stopSfx: function(trackName) {
        if (this.isLoaded(trackName)) {
            Crafty.audio.stop(trackName);
        }
        return this;
    },

    // Crafty's mute silences music and sfx together and keeps the music
    // position, so unmuting resumes where it left off.
    isMuted: function() {
        return Crafty.audio.muted;
    },

    toggleMute: function() {
        Crafty.audio.toggleMute();
        Crafty.trigger("MuteChanged", Crafty.audio.muted);
        return this;
    },

    isLoaded: function(trackName) {
        if (!trackName) {
            return false;
        }
        if (!Crafty.audio.sounds[trackName]) {
            console.warn("Audio track not in gameAssets:", trackName);
            return false;
        }
        return true;
    }
});
