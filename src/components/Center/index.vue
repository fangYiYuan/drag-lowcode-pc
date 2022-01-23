<template>
    <div 
        id="editor"
        class="editor edit"
        :style="{
            width: changeStyleWithScale(canvasStyleData.width) + 'px',
            height: changeStyleWithScale(canvasStyleData.height) + 'px',
        }"
        @contextmenu="handleContextMenu"
    >
        <!-- 网格线 -->
        <Grid />
        <Shape 
            v-for="(item, index) in componentData"
            :key="item.id"
            :default-style="item.style"
            :style="getShapeStyle(item.style)"
            :active="item.id === (curComponent || {}).id"
            :element="item"
            :index="index"
            :class="{ lock: item.isLock }"
        >
            <component
                :is="item.component"
                v-if="item.component != 'v-text'"
                :id="'component' + item.id"
                class="component"
                :style="getComponentStyle(item.style)"
                :prop-value="item.propValue"
                :element="item"
            />

            <component
                :is="item.component"
                v-else
                :id="'component' + item.id"
                class="component"
                :style="getComponentStyle(item.style)"
                :prop-value="item.propValue"
                :element="item"
                @input="handleInput"
            />
        </Shape>
        <!-- 标线 -->
        <MarkLine />
    </div>
</template>

<script>
import Grid from './Grid'
import MarkLine from './MarkLine.vue'
import { changeStyleWithScale } from '@/utils/translate'
import { getStyle } from '@/utils/style'
import { mapState } from 'vuex'
import Shape from './Shape'

export default {
    components: { Grid, Shape, MarkLine },
    props: {
        isEdit: {
            type: Boolean,
            default: true,
        },
    },
    data() { 
        return {
            editorX: 0,
            editorY: 0,
            start: { // 选中区域的起点
                x: 0,
                y: 0,
            },
            width: 0,
            height: 0,
            isShowArea: false,
        }
    },
    computed: mapState([
        'canvasStyleData',
        'componentData',
        'curComponent',
    ]),
    methods: {
        changeStyleWithScale,
        handleContextMenu() {
        
        },
        getShapeStyle(style) {
            const result = {};
            ['width', 'height', 'top', 'left', 'rotate'].forEach(attr => {
                if (attr != 'rotate') {
                    result[attr] = style[attr] + 'px'
                } else {
                    result.transform = 'rotate(' + style[attr] + 'deg)'
                }
            })

            return result
        },
        getComponentStyle(style) {
            return getStyle(style, ['top', 'left', 'width', 'height', 'rotate'])
        },
        handleInput(element, value) {
            // 根据文本组件高度调整 shape 高度
            this.$store.commit('setShapeStyle', { height: this.getTextareaHeight(element, value) })
        },

        getTextareaHeight(element, text) {
            let { lineHeight, fontSize, height } = element.style
            if (lineHeight === '') {
                lineHeight = 1.5
            }

            const newHeight = (text.split('<br>').length - 1) * lineHeight * fontSize
            return height > newHeight ? height : newHeight
        },
    },
}
</script>

<style lang="scss" scoped>
.editor {
    position: relative;
    background: #fff;
    margin: auto;

    .lock {
        opacity: .5;

        &:hover {
            cursor: not-allowed;
        }
    }
}

.edit {
    .component {
        outline: none;
        width: 100%;
        height: 100%;
    }
}
</style>