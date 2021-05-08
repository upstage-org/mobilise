import configs from "@/config";
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
            src: type === 'stream' ? null : src
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
        if (object.type === 'stream') {
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

export function namespaceTopic(topicName, stageUrl) {
    const url = stageUrl ?? store.getters['stage/url'];
    const namespace = configs.MQTT_NAMESPACE;
    return `${namespace}/${url}/${topicName}`;
}

export function unnamespaceTopic(topicName) {
    const url = store.getters['stage/url'];
    const namespace = configs.MQTT_NAMESPACE;
    return topicName.substring(namespace.length + url.length + 2);
}