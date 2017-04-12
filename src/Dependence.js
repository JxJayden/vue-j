// copy from vueux https://github.com/qieguo2016/Vueuv/blob/master/src/Dependence.js & will be refactor
import {
    log
} from './utils'
export default function Dep() {
    this.subs = {}
}

// 增加订阅者
Dep.prototype.addSub = function (target) {
    if (!this.subs[target.uid]) { //防止重复添加
        this.subs[target.uid] = target
    }
}

// 发布消息
Dep.prototype.notify = function (options) {
    for (var uid in this.subs) {
        this.subs[uid].update(options)
    }
}
