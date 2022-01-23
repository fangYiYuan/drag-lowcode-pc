import Vue from 'vue'
import Vuex from 'vuex'
import snapshot from './snapshot'

Vue.use(Vuex)
const data = {
    state: {
        ...snapshot.state,

        canvasStyleData: {
            width: 1200,
            height: 750,
            scale: 100,
        },
        componentData: [],
        curComponent: null,
        curComponentIndex: null,
        isClickComponent: false,
    },
    mutations: {
        ...snapshot.mutations,
        addComponent(state, { component, index }) {
            if (index) {
                state.componentData.splice(index, 0)
            } else {
                state.componentData.push(component)
            }
        }, 
        setShapeStyle({ curComponent }, { top, left, width, height, rotate }) {
            if (top) curComponent.style.top = top
            if (left) curComponent.style.left = left
            if (width) curComponent.style.width = width
            if (height) curComponent.style.height = height
            if (rotate) curComponent.style.rotate = rotate
        },
        setClickComponentStatus(state, status) {
            state.isClickComponent = status
        },
        setCurComponent(state, { component, index }) {
            state.curComponent = component
            state.curComponentIndex = index
        },
        setShapeSingleStyle({ curComponent }, { key, value }) {
            curComponent.style[key] = value
        },
    },
}

export default new Vuex.Store(data)