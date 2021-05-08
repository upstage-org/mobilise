import moment from 'moment'
import { v4 as uuidv4 } from "uuid";
import hash from 'object-hash';
import mqtt from '@/services/mqtt'
import { absolutePath, cloneDeep, randomColor, randomMessageColor, randomRange } from '@/utils/common'
import { TOPICS, BOARD_ACTIONS, BACKGROUND_ACTIONS } from '@/utils/constants'
import { deserializeObject, recalcFontSize, serializeObject, unnamespaceTopic } from './reusable';
import { getViewport } from './reactiveViewport';
import { stageGraph } from '@/services/graphql';
import { useAttribute } from '@/services/graphql/composable';
import { avatarSpeak } from '@/services/speech';

export default {
    namespaced: true,
    state: {
        preloading: true,
        model: null,
        background: null,
        backdropColor: '#ebffee',
        status: 'OFFLINE',
        subscribeSuccess: false,
        chat: {
            messages: [],
            color: randomMessageColor(),
            opacity: 0.9
        },
        board: {
            objects: [],
            drawings: [],
            texts: [],
        },
        tools: {
            avatars: [],
            props: [],
            backdrops: [],
            audios: [],
            streams: [],
            config: {
                animateDuration: 500,
                reactionDuration: 5000,
                ratio: 16 / 9,
            }
        },
        settingPopup: {
            isActive: false,
        },
        preferences: {
            isDrawing: true,
            text: {
                fontSize: '20px',
                fontFamily: 'Josefin Sans',
            }
        },
        settings: {
            chatVisibility: true,
        },
        hosts: [],
        reactions: [],
        viewport: getViewport(),
        sessions: [],
        session: null,
        replay: {
            timestamp: {
                begin: 0,
                end: 0,
                current: 0
            },
            timers: [],
            interval: null,
            speed: 32
        }
    },
    getters: {
        url(state) {
            return state.model ? state.model.fileLocation : 'demo';
        },
        objects(state) {
            return state.board.objects;
        },
        config(state) {
            return state.tools.config;
        },
        preloadableAssets(state) {
            const assets = []
                .concat(state.tools.avatars.map(a => a.src))
                .concat(state.tools.avatars.map(a => a.frames ?? []).flat())
                .concat(state.tools.props.map(p => p.src))
                .concat(state.tools.backdrops.map(b => b.src))
            return assets;
        },
        audios(state) {
            return state.tools.audios;
        },
        currentAvatar(state, getters, rootState) {
            const id = rootState.user.avatarId;
            return state.board.objects.find(o => o.id === id);
        },
        stageSize(state, getters) {
            let width = state.viewport.width;
            let height = state.viewport.height;
            let left = 0;
            let top = 0;
            const ratio = getters.config.ratio;
            if (width / height > ratio) {
                width = height * ratio;
                left = (window.innerWidth - width) / 2;
            } else {
                height = width / ratio;
                top = (window.innerHeight - height) / 2;
            }
            return { width, height, left, top };
        }
    },
    mutations: {
        SET_MODEL(state, model) {
            state.model = model
            if (model) {
                console.log(model)
                const media = useAttribute({ value: model }, 'media', true).value;
                if (media && media.length) {
                    media.forEach(item => {
                        if (item.type === 'stream') {
                            item.url = absolutePath(item.url);
                        } else {
                            item.src = absolutePath(item.src);
                        }
                        if (item.multi) {
                            item.frames = item.frames.map(src => absolutePath(src))
                        }
                        const key = item.type + 's';
                        if (!state.tools[key]) {
                            state.tools[key] = [];
                        }
                        state.tools[key].push(item)
                    });
                } else {
                    state.preloading = false;
                }
                const config = useAttribute({ value: model }, 'config', true).value;
                if (config) {
                    state.tools.config.ratio = config.ratio.width / config.ratio.height
                }
            }
        },
        CLEAN_STAGE(state, cleanModel) {
            if (cleanModel) {
                state.model = null;
            }
            state.status = 'OFFLINE';
            state.background = null;
            state.tools.avatars = [];
            state.tools.props = [];
            state.tools.backdrops = []
            state.tools.audios = []
            state.tools.streams = [];
            state.board.objects = [];
            state.board.drawings = [];
            state.board.texts = [];
            state.chat.messages = [];
            state.chat.color = randomColor();
        },
        SET_BACKGROUND(state, background) {
            state.background = background
        },
        SET_STATUS(state, status) {
            state.status = status
        },
        SET_SUBSCRIBE_STATUS(state, status) {
            state.subscribeSuccess = status
        },
        PUSH_CHAT_MESSAGE(state, message) {
            message.hash = hash(message)
            const lastMessage = state.chat.messages[state.chat.messages.length - 1]
            if (lastMessage && (lastMessage.hash === message.hash)) {
                return
            }
            state.chat.messages.push(message)
        },
        PUSH_OBJECT(state, object) {
            deserializeObject(object, true);
            state.board.objects.push(object)
        },
        UPDATE_OBJECT(state, object) {
            const { id } = object;
            deserializeObject(object);
            const model = state.board.objects.find(o => o.id === id);
            if (model) {
                Object.assign(model, object);
            }
        },
        DELETE_OBJECT(state, object) {
            const { id } = object;
            state.board.objects = state.board.objects.filter(o => o.id !== id);
        },
        SET_OBJECT_SPEAK(state, { avatar, speak }) {
            speak.hash = hash(speak)
            const { id } = avatar;
            let model = state.board.objects.find(o => o.id === id);
            if (model && model.speak?.hash !== speak.hash) {
                model.speak = speak;
                avatarSpeak(model);
                setTimeout(() => {
                    if (model.speak?.message === speak.message) { model.speak = null }
                }, 1000 + speak.message.split(' ').length * 1000);
            }
        },
        SET_PRELOADING_STATUS(state, status) {
            state.preloading = status;
        },
        UPDATE_AUDIO(state, audio) {
            const model = state.tools.audios.find(a => a.src === audio.src);
            if (model) {
                Object.assign(model, audio);
            }
        },
        SET_SETTING_POPUP(state, setting) {
            state.settingPopup = setting;
        },
        BRING_TO_FRONT(state, object) {
            const index = state.board.objects.findIndex(avatar => avatar.id === object.id);
            if (index > -1) {
                state.board.objects.push(state.board.objects.splice(index, 1)[0]);
            } else {
                state.board.objects.push(object)
            }
        },
        SEND_TO_BACK(state, object) {
            const index = state.board.objects.findIndex(avatar => avatar.id === object.id);
            if (index > -1) {
                state.board.objects.unshift(state.board.objects.splice(index, 1)[0]);
            } else {
                state.board.objects.push(object)
            }
        },
        SET_PREFERENCES(state, preferences) {
            Object.assign(state.preferences, preferences);
        },
        PUSH_DRAWING(state, drawing) {
            state.board.drawings.push(cloneDeep(drawing));
        },
        PUSH_TEXT(state, text) {
            state.board.texts.push(text);
        },
        PUSH_STREAM_TOOL(state, stream) {
            state.tools.streams.push(stream);
        },
        PUSH_STREAM_HOST(state, stream) {
            state.hosts.push(stream);
        },
        UPDATE_IS_DRAWING(state, isDrawing) {
            state.preferences.isDrawing = isDrawing;
        },
        UPDATE_IS_WRITING(state, isWriting) {
            state.preferences.isWriting = isWriting;
        },
        UPDATE_TEXT_OPTIONS(state, options) {
            Object.assign(state.preferences.text, options);
        },
        PUSH_REACTION(state, reaction) {
            state.reactions.push({
                reaction,
                x: randomRange(150, window.innerWidth) - 300,
                y: window.innerHeight - 100,
            });
            setTimeout(() => {
                state.reactions.shift();
            }, state.tools.config.reactionDuration);
        },
        UPDATE_VIEWPORT(state, viewport) {
            state.viewport = viewport;
        },
        RESCALE_OBJECTS(state, ratio) {
            state.board.objects.forEach(object => {
                object.x = object.x * ratio;
                object.y = object.y * ratio;
                object.w = object.w * ratio;
                object.h = object.h * ratio;
                recalcFontSize(object, s => s * ratio)
            })
        },
        SET_CHAT_OPACITY(state, opacity) {
            state.chat.opacity = opacity;
        },
        UPDATE_SESSIONS_COUNTER(state, session) {
            const index = state.sessions.findIndex(s => s.id === session.id)
            if (index > -1) {
                if (session.leaving) {
                    return state.sessions.splice(index, 1)
                } else {
                    Object.assign(state.sessions[index], session)
                }
            } else {
                state.sessions.push(session)
            }
            state.sessions = state.sessions.filter(s => moment().diff(moment(new Date(s.at)), 'minute') < 60);
            state.sessions.sort((a, b) => b.at - a.at);
        },
        SET_CHAT_VISIBILITY(state, visible) {
            state.settings.chatVisibility = visible
        },
        SET_BACKDROP_COLOR(state, color) {
            state.backdropColor = color
        },
        SET_REPLAY(state, replay) {
            Object.assign(state.replay, replay)
        }
    },
    actions: {
        connect({ commit, dispatch }) {
            commit('SET_STATUS', 'CONNECTING')

            const client = mqtt.connect();
            client.on("connect", () => {
                commit('SET_STATUS', 'LIVE')
                dispatch('subscribe');
                dispatch('joinStage');
            });
            client.on("error", () => {
                commit('SET_STATUS', 'OFFLINE')
            });
            mqtt.receiveMessage((payload) => {
                dispatch('handleMessage', payload);
            })
        },
        subscribe({ commit }) {
            const topics = {
                [TOPICS.CHAT]: { qos: 2 },
                [TOPICS.BOARD]: { qos: 2 },
                [TOPICS.BACKGROUND]: { qos: 2 },
                [TOPICS.AUDIO]: { qos: 2 },
                [TOPICS.REACTION]: { qos: 2 },
                [TOPICS.COUNTER]: { qos: 2 }
            }
            mqtt.subscribe(topics).then(res => {
                commit('SET_SUBSCRIBE_STATUS', true);
                console.log("Subscribed to topics: ", res);
            })
        },
        async disconnect({ dispatch }) {
            await dispatch('leaveStage', true);
            mqtt.disconnect();
        },
        handleMessage({ dispatch }, { topic, message }) {
            switch (topic) {
                case TOPICS.CHAT:
                    dispatch('handleChatMessage', { message });
                    break;
                case TOPICS.BOARD:
                    dispatch('handleBoardMessage', { message });
                    break;
                case TOPICS.BACKGROUND:
                    dispatch('handleBackgroundMessage', { message });
                    break;
                case TOPICS.AUDIO:
                    dispatch('handleAudioMessage', { message });
                    break;
                case TOPICS.REACTION:
                    dispatch('handleReactionMessage', { message });
                    break;
                case TOPICS.COUNTER:
                    dispatch('handleCounterMessage', { message });
                    break;
                default:
                    break;
            }
        },
        sendChat({ rootGetters, state, getters }, message) {
            if (!message) return;
            const user = rootGetters["user/chatname"];
            const payload = {
                user,
                message: message,
                color: state.chat.color.text,
                backgroundColor: state.chat.color.bg,
                at: +new Date()
            };
            mqtt.sendMessage(TOPICS.CHAT, payload);
            const avatar = getters['currentAvatar']
            if (avatar) {
                mqtt.sendMessage(TOPICS.BOARD, {
                    type: BOARD_ACTIONS.SPEAK,
                    avatar,
                    speak: payload,
                })
            }
        },
        handleChatMessage({ commit }, { message }) {
            const model = {
                user: 'Anonymous',
                color: "#000000"
            };
            if (typeof message === "object") {
                Object.assign(model, message)
            } else {
                model.message = message;
            }
            commit('PUSH_CHAT_MESSAGE', model)
        },
        placeObjectOnStage({ commit, dispatch }, data) {
            const object = {
                id: uuidv4(),
                w: 100,
                h: 100,
                ...data,
                opacity: 1,
            }
            const payload = {
                type: BOARD_ACTIONS.PLACE_OBJECT_ON_STAGE,
                object: serializeObject(object, true)
            }
            mqtt.sendMessage(TOPICS.BOARD, payload);
            if (object.type === 'stream') {
                commit('PUSH_STREAM_HOST', object);
            }
            if (data.type === 'avatar' || data.type === 'drawing') {
                dispatch("user/setAvatarId", object.id, { root: true });
            }
            return object;
        },
        shapeObject(action, object) {
            const payload = {
                type: BOARD_ACTIONS.MOVE_TO,
                object: serializeObject(object)
            }
            mqtt.sendMessage(TOPICS.BOARD, payload)
        },
        deleteObject(action, object) {
            object = serializeObject(object)
            if (object.type === 'drawing') {
                delete object.commands
            }
            const payload = {
                type: BOARD_ACTIONS.DESTROY,
                object
            }
            mqtt.sendMessage(TOPICS.BOARD, payload)
        },
        switchFrame(action, object) {
            const payload = {
                type: BOARD_ACTIONS.SWITCH_FRAME,
                object: serializeObject(object),
            }
            mqtt.sendMessage(TOPICS.BOARD, payload)
        },
        bringToFront(action, object) {
            const payload = {
                type: BOARD_ACTIONS.BRING_TO_FRONT,
                object: serializeObject(object)
            }
            mqtt.sendMessage(TOPICS.BOARD, payload)
        },
        sendToBack(action, object) {
            const payload = {
                type: BOARD_ACTIONS.SEND_TO_BACK,
                object: serializeObject(object)
            }
            mqtt.sendMessage(TOPICS.BOARD, payload)
        },
        toggleAutoplayFrames(action, object) {
            const payload = {
                type: BOARD_ACTIONS.TOGGLE_AUTOPLAY_FRAMES,
                object: serializeObject(object),
            }
            mqtt.sendMessage(TOPICS.BOARD, payload);
        },
        handleBoardMessage({ commit }, { message }) {
            switch (message.type) {
                case BOARD_ACTIONS.PLACE_OBJECT_ON_STAGE:
                    commit('PUSH_OBJECT', message.object);
                    break;
                case BOARD_ACTIONS.MOVE_TO:
                    commit('UPDATE_OBJECT', message.object);
                    break;
                case BOARD_ACTIONS.DESTROY:
                    commit('DELETE_OBJECT', message.object);
                    break;
                case BOARD_ACTIONS.SWITCH_FRAME:
                    commit('UPDATE_OBJECT', message.object);
                    break;
                case BOARD_ACTIONS.SPEAK:
                    commit('SET_OBJECT_SPEAK', message);
                    break;
                case BOARD_ACTIONS.BRING_TO_FRONT:
                    commit('BRING_TO_FRONT', message.object);
                    break;
                case BOARD_ACTIONS.SEND_TO_BACK:
                    commit('SEND_TO_BACK', message.object);
                    break;
                case BOARD_ACTIONS.TOGGLE_AUTOPLAY_FRAMES:
                    commit('UPDATE_OBJECT', message.object);
                    break;
                default:
                    break;
            }
        },
        setBackground(action, background) {
            mqtt.sendMessage(TOPICS.BACKGROUND, { type: BACKGROUND_ACTIONS.CHANGE_BACKGROUND, background })
        },
        showChatBox(action, visible) {
            mqtt.sendMessage(TOPICS.BACKGROUND, { type: BACKGROUND_ACTIONS.SET_CHAT_VISIBILITY, visible })
        },
        setBackdropColor(action, color) {
            mqtt.sendMessage(TOPICS.BACKGROUND, { type: BACKGROUND_ACTIONS.SET_BACKDROP_COLOR, color })
        },
        handleBackgroundMessage({ commit }, { message }) {
            switch (message.type) {
                case BACKGROUND_ACTIONS.CHANGE_BACKGROUND:
                    commit('SET_BACKGROUND', message.background);
                    break;
                case BACKGROUND_ACTIONS.SET_CHAT_VISIBILITY:
                    commit('SET_CHAT_VISIBILITY', message.visible)
                    break;
                case BACKGROUND_ACTIONS.SET_BACKDROP_COLOR:
                    commit('SET_BACKDROP_COLOR', message.color)
                    break;
                default:
                    break;
            }
        },
        playAudio(_, audio) {
            audio.isPlaying = true;
            mqtt.sendMessage(TOPICS.AUDIO, audio)
        },
        pauseAudio(_, audio) {
            audio.isPlaying = false;
            mqtt.sendMessage(TOPICS.AUDIO, audio)
        },
        handleAudioMessage({ commit }, { message }) {
            commit('UPDATE_AUDIO', message)
        },
        closeSettingPopup({ commit }) {
            commit('SET_SETTING_POPUP', { isActive: false })
        },
        openSettingPopup({ commit }, setting) {
            setting.isActive = true;
            commit('SET_SETTING_POPUP', setting)
        },
        addDrawing({ commit, dispatch }, drawing) {
            drawing.type = 'drawing';
            commit('PUSH_DRAWING', drawing);
            return dispatch('placeObjectOnStage', drawing);
        },
        addStream({ commit, dispatch }, stream) {
            stream.type = 'stream';
            commit('PUSH_STREAM_TOOL', stream);
            dispatch('placeObjectOnStage', stream)
        },
        addText({ commit, dispatch }, text) {
            text.type = 'text';
            commit('PUSH_TEXT', text);
            dispatch('placeObjectOnStage', text)
        },
        handleReactionMessage({ commit }, { message }) {
            commit('PUSH_REACTION', message)
        },
        sendReaction(_, reaction) {
            mqtt.sendMessage(TOPICS.REACTION, reaction);
        },
        async loadStage({ commit, dispatch }, { url, recordId }) {
            commit('CLEAN_STAGE', true);
            commit('SET_PRELOADING_STATUS', true);
            const model = await stageGraph.loadStage(url, recordId)
            if (model) {
                commit('SET_MODEL', model);
                const { events } = model
                if (recordId) {
                    commit('SET_REPLAY', {
                        timestamp: {
                            begin: events[0].mqttTimestamp,
                            current: events[0].mqttTimestamp,
                            end: events[events.length - 1].mqttTimestamp,
                        }
                    })
                } else {
                    events.forEach(event => dispatch('replayEvent', event));
                }
            } else {
                commit('SET_PRELOADING_STATUS', false);
            }
        },
        replayEvent({ dispatch }, { topic, payload }) {
            dispatch("handleMessage", {
                topic: unnamespaceTopic(topic),
                message: JSON.parse(payload),
            })
        },
        async replayRecord({ state, dispatch, commit }, timestamp) {
            await dispatch('pauseReplay');
            const current = timestamp ? Number(timestamp) : state.replay.timestamp.begin
            state.replay.timestamp.current = current
            commit('CLEAN_STAGE')
            state.replay.isReplaying = true
            const events = state.model.events
            const speed = state.replay.speed
            state.replay.interval = setInterval(() => {
                state.replay.timestamp.current += 10
                if (state.replay.timestamp.current > state.replay.timestamp.end) {
                    dispatch('pauseReplay');
                }
            }, 1000 / speed)
            events.forEach(event => {
                const timer = setTimeout(() => {
                    dispatch('replayEvent', event);
                }, (event.mqttTimestamp - current) * 100 / speed)
                state.replay.timers.push(timer)
            });
        },
        pauseReplay({ state }) {
            clearInterval(state.replay.interval)
            state.replay.interval = null
            state.replay.timers.forEach(timer => clearTimeout(timer))
            state.replay.timers = []
        },
        handleCounterMessage({ commit, state }, { message }) {
            commit('UPDATE_SESSIONS_COUNTER', message)
            if (message.id === state.session && message.avatarId) {
                commit('user/SET_AVATAR_ID', message.avatarId, { root: true });
            }
        },
        async joinStage({ rootGetters, state, rootState }) {
            if (!state.session) {
                state.session = rootState.user.user?.id ?? uuidv4()
            }
            const id = state.session
            const isPlayer = rootGetters['auth/loggedIn'];
            const nickname = rootGetters['user/nickname'];
            const avatarId = rootGetters['user/avatarId'];
            const at = +new Date();
            const payload = { id, isPlayer, nickname, at, avatarId }
            if (!payload.avatarId) {
                delete payload.avatarId
            }
            await mqtt.sendMessage(TOPICS.COUNTER, payload);
        },
        async leaveStage({ state }) {
            const id = state.session
            state.session = null
            await mqtt.sendMessage(TOPICS.COUNTER, { id, leaving: true });
        }
    },
};
