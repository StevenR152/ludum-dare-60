// One instance (audioController, created in main.js) persists across scenes.
// Owns which looping tracks should be playing and the single mute state.
// "music" and "ambient" are independent channels so the background theme (Start/Game/End)
// and the location loop (Workshop/Forest, see GameSounds.updateAmbient) can play together
// in the Game scene without one cutting the other off.
Crafty.c("AudioController", {
    init: function() {
        this.requires("Persist");
        this.channels = {}; // channel name -> {track, volume}
        if (START_MUTED) {
            Crafty.audio.mute();
        }
        // Browsers block audio until the player interacts with the page,
        // so requested music waits for the first click or key press.
        this.unlocked = false;
        var unlock = function () {
            this.unlocked = true;
            Object.keys(this.channels).forEach(function (channel) {
                this.startChannel(channel);
            }.bind(this));
            document.removeEventListener("pointerdown", unlock);
            document.removeEventListener("keydown", unlock);
        }.bind(this);
        document.addEventListener("pointerdown", unlock);
        document.addEventListener("keydown", unlock);
    },

    // Safe to call from every scene: keeps playing if it's already this track on this channel.
    playMusic: function(trackName, volume) {
        return this.playChannel("music", trackName, volume);
    },

    stopMusic: function() {
        return this.stopChannel("music");
    },

    // The Workshop/Forest location loop (see GameSounds.updateAmbient), independent of playMusic.
    playAmbient: function(trackName, volume) {
        return this.playChannel("ambient", trackName, volume);
    },

    stopAmbient: function() {
        return this.stopChannel("ambient");
    },

    playChannel: function(channel, trackName, volume) {
        var current = this.channels[channel];
        if (current && current.track !== trackName) {
            Crafty.audio.stop(current.track);
        }
        this.channels[channel] = {track: trackName, volume: volume === undefined ? MUSIC_VOLUME : volume};
        this.startChannel(channel);
        return this;
    },

    stopChannel: function(channel) {
        var current = this.channels[channel];
        if (current) {
            Crafty.audio.stop(current.track);
        }
        delete this.channels[channel];
        return this;
    },

    startChannel: function(channel) {
        var current = this.channels[channel];
        if (!current || !this.unlocked || !this.isLoaded(current.track)) {
            return;
        }
        if (Crafty.audio.isPlaying(current.track)) {
            this.setPlayingVolume(current.track, current.volume);
            return;
        }
        Crafty.audio.play(current.track, -1, current.volume);
    },

    // A track that kept playing across scenes (the Start music into the Game) still takes the new scene's volume.
    setPlayingVolume: function(trackName, volume) {
        Crafty.audio.channels.forEach(function (channel) {
            if (channel.active && channel.id === trackName) {
                channel.volume = volume;
                channel.obj.volume = Crafty.audio.muted ? 0 : volume;
            }
        });
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
