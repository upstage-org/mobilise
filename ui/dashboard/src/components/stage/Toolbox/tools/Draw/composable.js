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

const wait = milisecond => new Promise(res => setTimeout(res, milisecond))

const execute = async (ctx, command, animate) => {
    const { type, size, color, lines } = command;
    if (lines && lines.length) {
        if (type === 'draw') {
            for (let i = 0; i < lines.length; i++) {
                const { fromX, fromY, x, y } = lines[i];
                draw(ctx, {
                    fromX, fromY, x, y, size, color
                });
                if (animate) {
                    await wait(10)
                }
            }
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
        lines: []
    });

    const history = reactive([])

    const cropImageFromCanvas = () => {
        return canvasUtil.cropImageFromCanvas(el.value);
    };

    const getDrawedArea = () => {
        return canvasUtil.clipDrawedArea(el.value)
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
            history.push({
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
            history.length = 0
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
            history.length = 0
        }
        return ctx;
    }

    const undo = () => {
        const ctx = clearCanvas();
        history.pop();
        history.forEach(command => execute(ctx, command))
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

    return { el, cursor, color, size, mode, history, cropImageFromCanvas, getDrawedArea, clearCanvas, undo, toggleErase }
}

export const useRelativeCommands = drawing => computed(() => {
    if (!drawing.commands) {
        return []
    }
    const ratio = Math.min(drawing.w / drawing.original.w, drawing.h / drawing.original.h);
    return drawing.commands.map(command => ({
        ...command,
        size: command.size * ratio,
        x: (command.x - drawing.original.x) * ratio,
        y: (command.y - drawing.original.y) * ratio,
        lines: command.lines.map(line => ({
            x: (line.x - drawing.original.x) * ratio,
            y: (line.y - drawing.original.y) * ratio,
            fromX: (line.fromX - drawing.original.x) * ratio,
            fromY: (line.fromY - drawing.original.y) * ratio,
        }))
    }))
})

export const useDrawing = (drawing) => {
    const el = ref(null);
    const commands = useRelativeCommands(drawing)

    const draw = async (newDrawing, oldDrawing) => {
        const { value: canvas } = el;
        canvas.width = drawing.w;
        canvas.height = drawing.h;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < commands.value.length; i++) {
            const command = commands.value[i];
            let shouldAnimate = true;
            if (newDrawing && oldDrawing) {
                if (i < oldDrawing.commands.length - 1) {
                    shouldAnimate = false
                }
            }
            execute(ctx, command, shouldAnimate)
        }
        return ctx;
    }

    watch(drawing, draw)
    onMounted(draw)

    return { el }
}