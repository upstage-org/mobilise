import store from "@/store";

export function toRelative(size) {
    const stageSize = store.getters['stage/stageSize'];
    return size / stageSize.width;
}

export function toAbsolute(size) {
    const stageSize = store.getters['stage/stageSize'];
    return size * stageSize.width;
}

export function recalcFontSize(object, f) {
    if (object.type === 'text') {
        object.fontSize = f(object.fontSize.slice(0, -2)) + 'px'
    }
}

export function serializeObject(object, keepSrc) {
    const { src, type } = object;
    if (!keepSrc) {
        object = {
            ...object,
            src: type === 'drawing' || type === 'stream' || type === 'text' ? null : src
        };
    }
    object.x = toRelative(object.x)
    object.y = toRelative(object.y)
    object.w = toRelative(object.w)
    object.h = toRelative(object.h)
    recalcFontSize(toRelative);
    return object;
}

export function deserializeObject(object, keepSrc) {
    if (!keepSrc) {
        if (object.type === 'drawing' || object.type === 'stream' || object.type === 'text') {
            delete object.src;
        }
    }
    object.x = toAbsolute(object.x)
    object.y = toAbsolute(object.y)
    object.w = toAbsolute(object.w)
    object.h = toAbsolute(object.h)
    recalcFontSize(toAbsolute);
    return object;
}

export function namespaceTopic(topicName) {
    const url = store.getters['stage/url'];
    return `${url}/${topicName}`;
}

export function unnamespaceTopic(topicName) {
    const url = store.getters['stage/url'];
    return topicName.substring(url.length + 1);
}