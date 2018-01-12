'use static'

class ImageEditer {

    constructor(props) {
        this.props = Object.assign({}, props)
        this.isMove = false // 是否在拖动
        this.createDom()
        this.events()
        this.canvasOffset = { // 画布相对于可视窗口的偏移
            top: 0,
            left: 0
        }
        this.mousePos = { // 鼠标在画布内的位置
            startTop: 0, // 鼠标点击时的top
            startLeft: 0, // 鼠标点击时的left
            endTop: 0, // 鼠标移动时的top
            endLeft: 0 // 鼠标移动时的left
        }
        this.clipSize = { // 裁剪框的位置和大小, 默认大小100的正方形
            top: 0,
            left: 0,
            width: 100,
            height: 100
        }
    }

    css(el, attr) {
        return window.getComputedStyle(el, null)[attr]
    }

    offset(el) {
        let _offset = {
            top: 0,
            left: 0
        }

        let _scroll = {
            left: document.body.scrollLeft || document.documentElement.scrollLeft,
            top: document.body.scrollTop || document.documentElement.scrollTop
        }

        while (el) {
            _offset.left += el.offsetLeft
            _offset.top += el.offsetTop
            el = el.offsetParent
        }

        _offset.top -= _scroll.top
        _offset.left -= _scroll.left
        return _offset
    }

    createDom() {
        this.editer = document.createElement('div') // 容器
        this.editer.className = 'imageediter'
        this.editer.innerHTML = '<div class="imageediter-wrap"><div class="imageediter-container"><canvas></canvas></div><div class="imageediter-info"></div></div><div class="imageediter-btns"><a class="imageediter-btn" href="javascript:;">确定</a><a class="imageediter-btn" href="javascript:;">取消</a></div>'
        this.container = this.editer.querySelector('.imageediter-container')
        const btns = this.editer.querySelectorAll('.imageediter-btn')
        this.confirmBtn = btns.item(0)
        this.cancelBtn = btns.item(1)
        this.clipinfo = this.editer.querySelector('.imageediter-info')
        this.canvas = this.editer.querySelector('canvas')
        document.body.appendChild(this.editer)
        this.initCanvas()
    }

    // 初始化画布
    initCanvas() {
        this.canvas.width = parseInt(this.css(this.container, 'width'))
        this.canvas.height = parseInt(this.css(this.container, 'height'))
    }

    // 加载素材
    loadImg() {
        return new Promise(resolve => {
            this.img = new Image()
            this.img.onload = () => resolve(this.img)
            this.img.src = './photo.jpg'
        })
    }

    drawImg() {
        this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height)
    }

    // 绘制遮罩
    drawMask(x, y, w, h) {
        if (!this.img) return
        this.ctx.fillStyle = 'rgba(0, 0, 0, .5)'
        this.ctx.strokeStyle = '#39f'
        this.ctx.lineWidth = 2
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.rect(x, y, w, h)
        this.ctx.stroke()
        this.ctx.clip()
        this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height)
    }

    // 创建裁剪动画
    drawClip() {
        this.showClipData()
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.beginPath()
        this.ctx.save()
        this.drawImg()
        this.drawMask(this.clipSize.left, this.clipSize.top, this.clipSize.width, this.clipSize.height)
        this.ctx.restore()
    }

    // 显示裁剪数据
    showClipData() {
        this.clipinfo.innerHTML = `<div>宽度：${Math.abs(this.clipSize.width)}</div><div>高度：${Math.abs(this.clipSize.height)}</div>`
    }

    events() {
        this.confirmBtn.addEventListener('click', event => {
            this.ctx = this.canvas.getContext('2d')
            this.canvasOffset = this.offset(this.canvas)
            this.loadImg().then(data => this.drawImg())
        }, false)

        this.canvas.addEventListener('mousedown', event => {
            this.isMove = true
            Object.assign(this.mousePos, {
                startTop: event.clientY - this.canvasOffset.top,
                startLeft: event.clientX - this.canvasOffset.left
            })
        }, false)

        this.canvas.addEventListener('mousemove', event => {
            if(this.isMove) {
                Object.assign(this.mousePos, {
                    endTop: event.clientY - this.canvasOffset.top,
                    endLeft: event.clientX - this.canvasOffset.left
                })
                Object.assign(this.clipSize, {
                    top: this.mousePos.startTop,
                    left: this.mousePos.startLeft,
                    width: this.mousePos.endLeft - this.mousePos.startLeft,
                    height: this.mousePos.endTop - this.mousePos.startTop
                })
                this.drawClip()
                event.preventDefault()
            }
        }, false)

        this.canvas.addEventListener('mouseup', event => {
            this.isMove = false
        })
    }

}

const imageEditer = new ImageEditer()