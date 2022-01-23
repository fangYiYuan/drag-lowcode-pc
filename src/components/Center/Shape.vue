<template>
    <div
        class="shape"
        @click="selectCurComponent"
        @mousedown="handleMouseDownOnShape"
    >
        <!-- <span
            v-show="isActive()"
            class="iconfont icon-xiangyouxuanzhuan"
            @mousedown="handleRotate"
        ></span>
        <span
            v-show="element.isLock"
            class="iconfont icon-suo"
        ></span> -->
        <div
            v-for="item in active ? pointList : []"
            :key="item"
            class="shape-point"
            :style="getPointStyle(item)"
            @mousedown="handleMouseDownOnPoint(item, $event)"
        />
        <slot />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import eventBus from '@/utils/eventBus'
import { mod360 } from '@/utils/translate'
// import calculateComponentPositonAndSize from '@/utils/calculateComponentPositonAndSize'

export default {
    props: {
        active: {
            type: Boolean,
            default: false,
        },
        element: {
            require: true,
            type: Object,
            default: () => {},
        },
        defaultStyle: {
            require: true,
            type: Object,
            default: () => {},
        },
        index: {
            require: true,
            type: [Number, String],
            default: 0,
        },
    },
    data() {
        return {
            pointList: ['lt', 't', 'rt', 'r', 'rb', 'b', 'lb', 'l'], // 八个方向
            initialAngle: {
                // 每个点对应的初始角度
                lt: 0,
                t: 45,
                rt: 90,
                r: 135,
                rb: 180,
                b: 225,
                lb: 270,
                l: 315,
            },
            angleToCursor: [
                // 每个范围的角度对应的光标
                { start: 338, end: 23, cursor: 'nw' },
                { start: 23, end: 68, cursor: 'n' },
                { start: 68, end: 113, cursor: 'ne' },
                { start: 113, end: 158, cursor: 'e' },
                { start: 158, end: 203, cursor: 'se' },
                { start: 203, end: 248, cursor: 's' },
                { start: 248, end: 293, cursor: 'sw' },
                { start: 293, end: 338, cursor: 'w' },
            ],
            cursors: {},
        }
    },
    computed: mapState(['curComponent', 'editor']),
    methods: {
        selectCurComponent(e) {
            e.stopPropagation()
            e.preventDefault()
        },
        getCursor() {
            const { angleToCursor, initialAngle, pointList, curComponent } = this
            const rotate = mod360(curComponent.style.rotate) // 取余 360
            const result = {}
            let lastMatchIndex = -1 // 从上一个命中的角度的索引开始匹配下一个，降低时间复杂度

            pointList.forEach(point => {
                const angle = mod360(initialAngle[point] + rotate)
                const len = angleToCursor.length
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    lastMatchIndex = (lastMatchIndex + 1) % len
                    const angleLimit = angleToCursor[lastMatchIndex]
                    if (angle < 23 || angle >= 338) {
                        result[point] = 'nw-resize'

                        return
                    }

                    if (angleLimit.start <= angle && angle < angleLimit.end) {
                        result[point] = `${angleLimit.cursor}-resize`

                        return
                    }
                }
            })

            return result
        },
        handleMouseDownOnShape(e) {
            this.$store.commit('setClickComponentStatus', true)
            if (
                this.element.component != 'v-text'
                && this.element.component != 'rect-shape'
            ) {
                e.preventDefault()
            }

            e.stopPropagation()
            this.$store.commit('setCurComponent', {
                component: this.element,
                index: this.index,
            })
            if (this.element.isLock) return

            this.cursors = this.getCursor() // 根据旋转角度获取光标位置

            console.log('=>ddd', this.defaultStyle)
            const style = { ...this.defaultStyle }
            const startY = e.clientY
            const startX = e.clientX
            // 如果直接修改属性，值的类型会变为字符串，所以要转为数值型
            const startTop = Number(style.top)
            const startLeft = Number(style.left)

            // 如果元素没有移动，则不保存快照
            let hasMove = false
            const move = moveEvent => {
                hasMove = true
                // console.log('=>e', e)
                // console.log('=>moveEvent', moveEvent)
                // console.log('=>style', style)
                const curX = moveEvent.clientX
                const curY = moveEvent.clientY
                style.top = curY - startY + startTop
                style.left = curX - startX + startLeft
                // console.log('=>11', curY)
                // console.log('=>222', startY)
                // console.log('=>333', startTop)
                // console.log('=>333', style.top)
                // console.log('=>333', style.left)
                // 修改当前组件样式
                this.$store.commit('setShapeStyle', style)
                // 等更新完当前组件的样式并绘制到屏幕后再判断是否需要吸附
                // 如果不使用 $nextTick，吸附后将无法移动
                this.$nextTick(() => {
                    // 触发元素移动事件，用于显示标线、吸附功能
                    // 后面两个参数代表鼠标移动方向
                    // curY - startY > 0 true 表示向下移动 false 表示向上移动
                    // curX - startX > 0 true 表示向右移动 false 表示向左移动
                    eventBus.$emit('move', curY - startY > 0, curX - startX > 0)
                })
            }

            const up = () => {
                hasMove && this.$store.commit('recordSnapshot')
                // 触发元素停止移动事件，用于隐藏标线
                eventBus.$emit('unmove')
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)
            }

            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        },
        getPointStyle(point) {
            const { width, height } = this.defaultStyle
            const hasT = /t/.test(point)
            const hasB = /b/.test(point)
            const hasL = /l/.test(point)
            const hasR = /r/.test(point)
            // console.log('=>point', point)
            // console.log('=>hasL', hasL)
            let newLeft = 0
            let newTop = 0

            // 四个角的点
            if (point.length === 2) {
                newLeft = hasL ? 0 : width
                newTop = hasT ? 0 : height
            } else {
                // 上下两点的点，宽度居中
                if (hasT || hasB) {
                    newLeft = width / 2
                    newTop = hasT ? 0 : height
                }

                // 左右两边的点，高度居中
                if (hasL || hasR) {
                    newLeft = hasL ? 0 : width
                    newTop = Math.floor(height / 2)
                }
            }

            const style = {
                marginLeft: '-4px',
                marginTop: '-4px',
                left: `${newLeft}px`,
                top: `${newTop}px`,
                cursor: this.cursors[point],
            }

            return style
        },
        handleMouseDownOnPoint(point, e) {
            this.$store.commit('setClickComponentStatus', true)
            e.stopPropagation()
            e.preventDefault()

            const style = { ...this.defaultStyle }
            const height = Number(style.height)
            const width = Number(style.width)
            const top = Number(style.top)
            const left = Number(style.left)
            const startX = e.clientX
            const startY = e.clientY

            // let pointRect = e.target.getBoundingClientRect()
            // 第一次点击时也会触发 move，所以会有“刚点击组件但未移动，组件的大小却改变了”的情况发生
            // 因此第一次点击时不触发 move 事件
            let isFirst = true
            const move = moveEvent => {
                // console.log('=>moveEvent', moveEvent)
                if (isFirst) {
                    isFirst = false
                    return
                }
                const currX = moveEvent.clientX
                const currY = moveEvent.clientY
                const disY = currY - startY
                const disX = currX - startX
                const hasT = /t/.test(point)
                const hasB = /b/.test(point)
                const hasL = /l/.test(point)
                const hasR = /r/.test(point)
                const newHeight = height + (hasT ? -disY : hasB ? disY : 0)
                const newWidth = width + (hasL ? -disX : hasR ? disX : 0)
                style.height = newHeight > 0 ? newHeight : 0
                style.width = newWidth > 0 ? newWidth : 0
                style.top = top + (hasT ? disY : 0)
                style.left = left + (hasL ? disX : 0)
                this.$store.commit('setShapeStyle', style)
                // let timer = null
                // clearTimeout(timer)
                // timer = setTimeout(() => {
                //     console.log('=>newWidth', newWidth)
                //     this.$store.commit('setShapeStyle', style)
                // }, 500)
            }

            const up = () => {
                document.removeEventListener('mousemove', move)
                document.removeEventListener('mouseup', up)
                // needSave && this.$store.commit('recordSnapshot')
            }

            document.addEventListener('mousemove', move)
            document.addEventListener('mouseup', up)
        },
        isNeedLockProportion() {
            if (this.element.component != 'Group') return false
            const ratates = [0, 90, 180, 360]
            for (const component of this.element.propValue) {
                if (!ratates.includes(mod360(parseInt(component.style.rotate)))) {
                    return true
                }
            }

            return false
        },
    },
}
</script>

<style lang="scss" scoped>
.shape {
  position: absolute;

  &:hover {
    cursor: move;
  }
}

.active {
  outline: 1px solid #70c0ff;
  user-select: none;
}

.shape-point {
  position: absolute;
  background: #fff;
  border: 1px solid #59c7f9;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  z-index: 1;
}

.icon-xiangyouxuanzhuan {
  position: absolute;
  top: -34px;
  left: 50%;
  transform: translateX(-50%);
  cursor: grab;
  color: #59c7f9;
  font-size: 20px;
  font-weight: 600;

  &:active {
    cursor: grabbing;
  }
}

.icon-suo {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
