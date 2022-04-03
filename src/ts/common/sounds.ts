import { lerp } from "./util";

interface SoundInfo {
    audio?: HTMLAudioElement;
    loaded: boolean;
    loadPromise?: Promise<void>;
}

enum MuteState {
    PLAY_ALL = 0,
    MUSIC_OFF = 1,
    ALL_OFF = 2,
}

class _Sounds {
    audios: {[key: string]: SoundInfo} = {};

    curSong?: HTMLAudioElement;
    curSongName?: string;
    muteState = MuteState.PLAY_ALL;

    playbackRate = 1;

    /**
     * Asynchronously fetches an audio.
     */
    loadSound({name, path} : {name: string, path: string}) {
        const promise = new Promise<void>((resolve) => {
            if (this.audios.hasOwnProperty(name)) {
                throw new Error(`Already loaded sound ${name}.`);
            }

            if (!path.endsWith('/')) {
                path = path + '/';
            }
            const audioPath = `${path}${name}.mp3`;

            this.audios[name] = {
                loaded: false,
                audio: undefined,
            };

            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.audios[name].audio = audio;
                this.audios[name].loaded = true;
                resolve();
            }
            audio.onerror = () => {
                throw new Error(`Error loading audio ${name}.`);
            }
            audio.src = audioPath;
        });
        this.audios[name].loadPromise = promise;
        return promise;
    }

    playSound(name: string, {volume = 1}: {volume?: number} = {}) {
        if (this.muteState == MuteState.ALL_OFF) {
            return;
        }

        console.log(`Playing sound ${name}, audios = ${Object.keys(this.audios)}`);

        const audio = ((this.audios[name])?.audio?.cloneNode() as HTMLAudioElement);
        if (audio == null) {
            return;
        }
        // TODO: Adjust SFX volumes, probably just here.


        audio.volume *= volume;

        audio.playbackRate = this.playbackRate;

        // Disable type checking on these because typescript doesn't know about them yet.
        (audio as any).mozPreservesPitch = false;
        (audio as any).webkitPreservesPitch = false;
        (audio as any).preservesPitch = false;

        const promise = audio.play();
        // This may fail if the user hasn't interacted with the page yet.
        // For these one-off sound effects, we don't need to do anything.
        promise?.catch(() => {});
    }

    /** We still run the logic here when muted, so that we can update things when unmuted. */
    async setSong(songName: string) {
        console.log(`Setting song to ${songName}`);
        if (this.curSongName == songName) {
            return;
        }

        const lastSongName = this.curSongName;

        const lastSong = this.curSong;
        this.curSong?.pause();
        this.curSong = undefined;
        this.curSongName = undefined;

        const audioInfo = this.audios[songName];
        if (audioInfo == null) {
            // Setting an invalid song name is a way to stop audio from playing.
            return;
        }

        // Ensure the song is loaded
        await audioInfo.loadPromise;

        const audio = (audioInfo.audio?.cloneNode() as HTMLAudioElement);
        if (audio == null) {
            console.error(`Failed to clone audio for ${songName}`);
            return;
        }

        audio.volume = 0.5;
        audio.loop = true;
        // Disable type checking on these because not typescript doesn't know about them yet.
        (audio as any).mozPreservesPitch = false;
        (audio as any).webkitPreservesPitch = false;
        (audio as any).preservesPitch = false;

        if (lastSong != null) {
            audio.playbackRate = lastSong.playbackRate;

            if (lastSongName?.slice(0, 4) == songName.slice(0, 4)) {
                audio.currentTime = lastSong.currentTime;
            }
        }

        if (this.muteState == MuteState.PLAY_ALL) {
            const promise = audio.play();
            // This may fail if the user hasn't interacted with the page yet.
            // We'll try to play it again when startSongIfNotAlreadyPlaying is
            // called.
            promise?.catch(() => {});
        }

        this.curSong = audio;
        this.curSongName = songName;
    }

    updatePlaybackRate(desiredRate:number, dt: number) {
        const updateAmt = 1 - Math.exp(-10 * dt);
        this.playbackRate = lerp(this.playbackRate, desiredRate, updateAmt);

        if (this.curSong != null) {
            this.curSong.playbackRate = this.playbackRate;
        }
    }

    loadMuteState() {
        const storedMuteString = window.sessionStorage.getItem('mute') ?? "";

        // Quick thing to make local dev default to music off.
        if (storedMuteString == '' && window.location.href.includes('localhost')) {
            console.log('Disabling music for local development');
            this.muteState = MuteState.MUSIC_OFF;
            return;
        }

        let muteState = parseInt(storedMuteString);
        if (muteState != MuteState.PLAY_ALL &&
            muteState != MuteState.MUSIC_OFF &&
            muteState != MuteState.ALL_OFF) {

            muteState = MuteState.PLAY_ALL;
        }
        this.muteState = muteState;
    }

    toggleMute() {
        switch (this.muteState) {
            case MuteState.PLAY_ALL:
                this.muteState = MuteState.MUSIC_OFF;
                break;
            case MuteState.MUSIC_OFF:
                this.muteState = MuteState.ALL_OFF;
                break;
            case MuteState.ALL_OFF:
            default:
                this.muteState = MuteState.PLAY_ALL;
                break;
        }
        console.log(`Mute state is now ${this.muteState}`);
        window.sessionStorage.setItem('mute', this.muteState.toString());
        this.updateSoundMutedness();
    }

    updateSoundMutedness() {
        switch (this.muteState) {
            case MuteState.PLAY_ALL:
                if (this.curSong?.paused) {
                    const promise = this.curSong.play();
                    // Again, ignore the possible failure.
                    promise?.catch(() => {});
                }
                break;
            case MuteState.MUSIC_OFF:
            case MuteState.ALL_OFF:
                this.curSong?.pause();
                break;
        }
    }

    startSongIfNotAlreadyPlaying() {
        this.updateSoundMutedness();
    }
}

export const Sounds = new _Sounds();