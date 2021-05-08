import store from "@/store";
import { computed, reactive, ref } from "vue";
import hash from 'object-hash';
import { notification } from "@/utils/notification";

export const useRequest = (service, ...params) => {
    const loading = ref(false);
    const data = ref();
    const nodes = computed(() => {
        if (!data.value) return null;
        const key = Object.keys(data.value)[0];
        return data.value[key].edges.map((edge) => edge.node)
    });
    const pushNode = (node, reverse) => {
        if (data.value) {
            const key = Object.keys(data.value)[0];
            let edges = data.value[key].edges
            if (reverse) {
                edges.unshift({ node })
            } else {
                edges.push({ node })
            }
            data.value = { [key]: { edges } }
        }
    };
    const totalCount = computed(() => {
        if (!data.value) return 0;
        const key = Object.keys(data.value)[0];
        return data.value[key].totalCount
    });
    const cacheKeys = reactive([]);

    const fetch = async (...newParams) => {
        try {
            const payload = newParams.length ? newParams : params
            const cacheKey = hash({ service, payload });
            const cached = store.state.cache.graphql[cacheKey];
            if (cached) {
                data.value = cached;
            } else {
                loading.value = true;
                data.value = await service(...payload);
                if (data.value) {
                    store.commit('cache/SET_GRAPHQL_CACHE', { key: cacheKey, value: data.value });
                    cacheKeys.push(cacheKey)
                }
            }
            return data.value;
        } catch (error) {
            throw error.response.errors[0].message;
        } finally {
            loading.value = false;
        }
    }

    const clearCache = () => {
        store.commit('cache/CLEAR_GRAPHQL_CACHES', { keys: cacheKeys });
        cacheKeys.length = 0;
    }

    const refresh = (...params) => {
        clearCache();
        return fetch(...params);
    }

    return { loading, data, nodes, totalCount, fetch, clearCache, refresh, pushNode }
}

export const useMutation = (...params) => {
    const { refresh, ...rest } = useRequest(...params);
    const mutation = refresh
    const save = async (success, ...params) => {
        try {
            const response = await mutation(...params)
            if (typeof success === 'function') {
                success()
            } else {
                notification.success(success);
            }
            return response
        } catch (error) {
            notification.error(error)
        }
    }

    return { mutation, save, ...rest }
};


export const useQuery = (...params) => {
    const { fetch, ...rest } = useRequest(...params);
    fetch();
    return { fetch, ...rest }
};

export const useFirst = (nodes) => {
    return computed(() => (nodes.value && nodes.value.length && nodes.value[0]) ?? {});
}

export function useAttribute(node, attributeName, isJson) {
    return computed(() => {
        let value = node.value?.attributes?.find(a => a.name === attributeName)?.description;
        if (isJson && value) {
            value = JSON.parse(value);
        }
        return value;
    })
}

export function useOwners(nodes) {
    return computed(() => {
        let list = [];
        if (nodes.value) {
            nodes.value.forEach(({ owner }) => {
                if (!list.some((user) => user.username === owner.username)) {
                    list.push(owner);
                }
            });
        }
        return list;
    });
}