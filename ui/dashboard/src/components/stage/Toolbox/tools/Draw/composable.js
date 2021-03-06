import { computed, onMounted, reactive, ref, watch } from "vue";
import * as canvasUtil from '@/utils/canvas';

const eraseDot = (ctx, { x, y, size }) => {
    ctx.clearRect(x, y, size, size);
}

const drawDot = (ctx, { x, y, size, color }) => {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
};

const draw = (ctx, { fromX, fromY, x, y, size, color }) => {
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.stroke();
    ctx.closePath();
    drawDot(ctx, { x: fromX, y: fromY, size, color });
};

const execute = (ctx, command) => {
    const { type, size, color, lines } = command;
    if (lines && lines.length) {
        if (type === 'draw') {
            lines.forEach(({ fromX, fromY, x, y }) => draw(ctx, {
                fromX, fromY, x, y, size, color
            }))
        } else {
            lines.forEach(({ x, y }) => eraseDot(ctx, {
                x, y, size
            }))
        }
    } else {
        if (type === 'draw') {
            if (command.fromX && command.fromY) {
                draw(ctx, command)
            } else {
                drawDot(ctx, command)
            }
        } else {
            eraseDot(ctx, command);
        }
    }
}

export const useDrawable = () => {
    const color = ref("#000");
    const size = ref(10);
    const mode = ref("draw");
    const el = ref(null);

    const data = reactive({
        history: [],
        lines: []
    });

    const cropImageFromCanvas = () => {
        return canvasUtil.cropImageFromCanvas(el.value);
    };

    const findxy = (res, e) => {
        const { value: canvas } = el;
        const ctx = canvas.getContext("2d");
        const { left, top } = canvas.getBoundingClientRect();
        if (res == "down") {
            data.prevX = data.currX;
            data.prevY = data.currY;
            data.currX = e.clientX - left;
            data.currY = e.clientY - top;

            data.lines = []
            data.flag = true;
            data.dot_flag = true;

            let command = {
                type: mode.value,
                x: data.currX,
                y: data.currY,
                size: size.value,
                color: color.value
            }
            execute(ctx, command)
        }
        if (res == "up") {
            data.flag = false;
            data.history = data.history.concat({
                type: mode.value,
                size: size.value,
                color: color.value,
                lines: data.lines,
                x: data.currX,
                y: data.currY,
            })
        }
        if (res == "move") {
            if (data.flag) {
                data.prevX = data.currX;
                data.prevY = data.currY;
                data.currX = e.clientX - left;
                data.currY = e.clientY - top;
                const coords = {
                    x: data.currX,
                    y: data.currY,
                    fromX: data.prevX,
                    fromY: data.prevY,
                }
                let command = {
                    type: mode.value,
                    size: size.value,
                    color: color.value,
                    ...coords
                }
                execute(ctx, command)
                data.lines.push(coords)
            }
        }
    };

    const attachEventLinsteners = () => {
        const { value: canvas } = el;
        if (canvas) {
            data.history = []
            canvas.addEventListener(
                "mousemove",
                (e) => {
                    findxy("move", e);
                },
                false
            );
            canvas.addEventListener(
                "mousedown",
                (e) => {
                    findxy("down", e);
                },
                false
            );
            canvas.addEventListener(
                "mouseup",
                (e) => {
                    findxy("up", e);
                },
                false
            );
            canvas.addEventListener(
                "mouseout",
                (e) => {
                    findxy("out", e);
                },
                false
            );
        }
    }

    onMounted(attachEventLinsteners)

    const clearCanvas = (clearHistory) => {
        const { value: canvas } = el;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (clearHistory) {
            data.history = []
        }
        return ctx;
    }

    const undo = () => {
        const ctx = clearCanvas();
        data.history.pop();
        data.history.forEach(command => execute(ctx, command))
        return ctx;
    }

    const cursor = computed(() => {
        const canvas = document.createElement("canvas");
        canvas.width = size.value;
        canvas.height = size.value;
        const ctx = canvas.getContext("2d");
        if (mode.value === 'draw') {
            ctx.beginPath();
            const r = size.value / 2;
            ctx.arc(r, r, r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = color.value;
            ctx.fill();
            return `url(${canvas.toDataURL()}) ${r} ${r}, pointer`
        }
        if (mode.value === 'erase') {
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, size.value, size.value);
            ctx.strokeRect(0, 0, size.value, size.value);
        }
        return `url(${canvas.toDataURL()}), pointer`

    })

    const toggleErase = () => {
        if (mode.value === "erase") {
            mode.value = "draw";
        } else {
            mode.value = "erase";
        }
    };

    return { el, cursor, color, size, mode, cropImageFromCanvas, clearCanvas, undo, toggleErase, data }
}

export const useDrawing = (commands) => {
    const el = ref(null);

    watch(commands, () => {
        if (!el.value) return;
        const { value: canvas } = el;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        commands.value.forEach(command => execute(ctx, command))
        return ctx;
    })

    return { el }
}