<template>
    <div ref="chart" class="grid-chart">
    </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
    props: {
        element: {
            type: Object,
            default: () => {},
        },
    },
    data() { 
        return {
            myChart: null,
            timer: null,
        }
    },
    watch: {
        'element.style.width': {
            handler(n) {
                console.log('=>11111', n)
                echarts.dispose(this.myChart)
                clearTimeout(this.timer)
                this.timer = setTimeout(this.init, 1000)
            },
        },
        'element.style.height': {
            handler(n) {
                console.log('=>222222', n)
                echarts.dispose(this.myChart)
                clearTimeout(this.timer)
                this.timer = setTimeout(this.init, 1000)
            },
        },
    },
    mounted() {
        console.log('=>', this.element)
        this.init()
    },
    methods: {
        init() {
            if (!this.$refs.chart) return
            // echarts.dispose(this.myChart)
            this.myChart = null
            const { width, height } = this.element.style
            this.myChart = echarts.init(this.$refs.chart, 'dark', {
                width,
                height,
            })

            const option = {
                title: {
                    text: '示例标题',
                    subtext: 'Feature Sample: Gradient Color, Shadow, Click Zoom',
                },
                xAxis: {
                    type: 'category',
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        type: 'bar',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 180, 180, 0.2)',
                        },
                        data: [120, 200, 150, 80, 70, 110, 130],
                        itemStyle: {
                            color: {
                                type: 'linear',
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [{
                                    offset: 0, color: '#02f7cc', // 0% 处的颜色
                                }, {
                                    offset: 1, color: '#2986cf', // 100% 处的颜色
                                }],
                                global: false, // 缺省为 false
                            },
                            borderColor: '#0b818b',
                        },
                        barWidth: 10,
                    },
                ],
            }

            this.myChart.setOption(option, true)
        },
    },
}
</script>

<style lang="scss" scoped>
</style>