<template>
    <div class="home">
        <ToolBar />
        <main>
            <section class="left">
                <Left />
            </section>
            <section class="center">
                <div
                    class="content"
                    @drop="handleDrop"
                    @dragover="handleDragOver"
                    @mousedown="handleMouseDown"
                    @mouseup="deselectCurComponent"
                >
                    <Center />
                </div>
            </section>
            <section class="right">
                <el-tabs v-model="activeName">
                    <el-tab-pane
                        label="属性"
                        name="attr"
                    >
                        <AttrList v-if="curComponent" />
                        <p
                            v-else
                            class="placeholder"
                        >
                            请选择组件
                        </p>
                    </el-tab-pane>
                    <el-tab-pane
                        label="动画"
                        name="animation"
                    >
                        <AnimationList v-if="curComponent" />
                        <p
                            v-else
                            class="placeholder"
                        >
                            请选择组件
                        </p>
                    </el-tab-pane>
                    <el-tab-pane
                        label="事件"
                        name="events"
                    >
                        <EventList v-if="curComponent" />
                        <p
                            v-else
                            class="placeholder"
                        >
                            请选择组件
                        </p>
                    </el-tab-pane>
                </el-tabs>
            </section>
        </main>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import ToolBar from '@/components/ToolBar'
import Left from '@/components/Left'
import Center from '@/components/Center'
import AttrList from '@/components/Right/AttrList' // 右侧属性列表
import AnimationList from '@/components/Right/AnimationList' // 右侧动画列表
import EventList from '@/components/Right/EventList' // 右侧事件列表
import { deepCopy } from '@/utils/utils'
import generateID from '@/utils/generateID'
import componentList from '../custom-component/list' // 左侧列表数据

export default {
    components: { ToolBar, Left, Center, AttrList, AnimationList, EventList },
    data() {
        return {
            activeName: 'attr',
            reSelectAnimateIndex: undefined,
        }
    },
    computed: mapState([
        'curComponent',
        // 'componentData',
        'isClickComponent',
    // 'canvasStyleData',
    // 'editor',
    ]),
    methods: {
        handleDragOver(e) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
        },
        handleDrop(e) {
            e.stopPropagation()
            e.preventDefault()
            const index = e.dataTransfer.getData('index')
            if (index) {
                const component = deepCopy(componentList[index])
                component.id = generateID()
                // eslint-disable-next-line no-undef
                const reacInfo = document.querySelector('#editor').getBoundingClientRect()
                component.style.top = e.clientY - reacInfo.y
                component.style.left = e.clientX - reacInfo.x
                this.$store.commit('addComponent', { component })
            }
        },
        handleMouseDown() {
            this.$store.commit('setClickComponentStatus', false)
        },

        deselectCurComponent(e) {
            if (!this.isClickComponent) {
                this.$store.commit('setCurComponent', { component: null, index: null })
            }

            // 0 左击 1 滚轮 2 右击
            if (e.button != 2) {
                this.$store.commit('hideContextMenu')
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import '@/styles/base';

  .home{
    height: 100vh;
    background: #1b1f25;
    background-image: url('../assets/bg.png');
    background-size: 100% 100%;
    box-shadow: 0 0 3px blue;
    main{
      height: calc(100% - 64px);
      position: relative;
      .left{
        position: absolute;
        top: 0;
        left: 0;
        width: 200px;
        height: 100%;
        padding-top: 10px;
        background: #1b1f25;
      }
      .right {
        position: absolute;
        right: 0;
        top: 0;
        width: 262px;
        height: 100%;
      }
      .center{
        margin-left: 200px;
        margin-right: 262px;
        padding: 20px;
        overflow: auto;
        height: 100%;
        background: #1b1f25;
        .content {
                width: 100%;
                height: 100%;
                overflow: auto;
            }
      }
    }
    .placeholder {
        text-align: center;
        color: #333;
    }
  }
</style>
