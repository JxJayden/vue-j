# VUE 阅读笔记
## [5200951]

#### Seed(el, options)
- 拷贝 options 到 this
- new Scope
- 如果有 data 则拷贝到 scope
- invoke ctrl
- call _compileNode
- extract dependencies for computed properties

#### _compileNode
- 文本节点：_compileTextNode
- 其他节点：

 > if sd-each
 > parse as dir
 > seed bind dir
 >
 > if ctrl but not root
 >  new chid Seed
 >
 > else
 > each attr
 >     each exp
 >         parse as dir
 >         seed bind dir
 > 递归 compile child nodes

#### _compileTextNode

#### _bind
- traceOwnerSeed
- call seed._createBinding
- binding <-> dir
- directive.bind // 指令执行前需要预处理，如：初始化变量
- directive.update
- directive.refresh

#### Scope
- property
- $seed
- $el
- $index
- $parent
- $watchers
- method
- $watch
- $unwatch
- $dump
- $destroy
- $serialize

#### Directive (directive-parser)
- new Directive(dirname, expression, oneway)
- set this._update
- call this.parseKey
- call parseFilter
- property
- oneway
- directiveName
- expression
- rawKey
- filters
- arg
- inverse
- nesting
- root
- key
- method
- update
- refresh
- apply
- applyFilters
- parseKey
- parseFilter
- deps-parser
- observer
- parse

#### Binding
```javascript
	this.inspect(utils.getNestedValue(seed.scope, path))
	this.def(seed.scope, path) // Define getter/setter for this binding on scope
```

- property
- seed
- key
- instances
- subs
- deps
- isComputed
- value
- inspect (value)

> Pre-process a passed in value based on its type
> 如果是 {get:, set:} 则标记 computed
> 如果是 Array, 则 拦截数组原生方法

- def : 定义 getter/setter
- update
- pub: `each subs : dir.refresh()`

# [498778e]
> 0.3.2 - make it actually work for Browserify

```
vm
- $el
- $parent
- $compiler <<=>>
	- el
	- vm <<=>>
	- directives [dir,...]
					- rawKey // 除去过滤器
					- expression // 完整
					- directiveName
					- _update
					- filters [{name:x,apply:x,args}...]
					- isExp
					- nesting ^ 往上多少级父亲
					- arg // arg: key
					- key
					- root (Bool)
					- compiler: $compiler
					- vm: <<=>> $compiler.vm

	- expressions [binding] // 表达式
	- observables [binding] // 非 {get: xx} 的对象 和 数组
	- computed [binding] //  表达式 or {get: xx} 成员
	- contextBindings[binding] // {get: fun} fun中有依赖的
	- parentCompiler
	- bindings [binding]
					- value
					- isComputed
					- rawGet
					- contextDeps

	- rootCompiler
	- observer(Emitter)
		- proxies {}

-------------------------------------------------------------------------------

compiler.bindings = {
	value
	isExp (Bool)
	root
	compiler <<=>> $compiler
	key: {}
	instances: []
	subs: []
	deps: []
}

-------------------------------------------------------------------------------

依赖关系是用 binding 的引用

binding.update()
    each dir in instances : dir.update()
    call pub()
        ==>
        each binding in subs : dir.refresh()
                                    ==>
                                    each dir in instances : dir.refresh()

外部引起的值改变先是 update 再触发依赖自己的 computed 成员去 refresh
```
---

#### ViewModel
- ViewModel(options) => new Compiler(ViewModel, options)
- $set 对 vm 设值，key 可以为 a.b.c 这样的
- $get
- $watch
- $unwatch
- $destroy

#### Compiler
- Compiler
1. extend(options)
2. extend(options.data)
3. determine el
4. prototypal inheritance of bindings
5. setup observer
6. call options.init
7. for key in vm : createBinding(key)
8. compileNode
9. for bindIns in observables : Observer.observe(bindIns.value, bindIns.key, this.observer)
10. DepsParser.parse(computed)
11. bindContexts(ctxBindings)

- setupObserver
```
observer
	.on('get', callback)
	.on('set', callback)
	.on('mutate', callback)
```

- compileNode
```
if textNode
	compileTextNode
else if 标签元素
	if sd-each
		parse then bindDirective
else if sd-vm 且 非根
	new ChildVM
else // normal node
	遍历属性，跳过有 vm 声明的
	遍历表达式
	parse then bindDirective
	递归 compile 子元素
```

- createBinding(key, isExp)

```
new Binding
表达式
	ExpParser.parseGetter
	binding.value = { get: getter }
	this.markComputed(binding)
	this.expressions.push(binding)
非表达式
	compiler.bindings[key] = new Binding
	ensurePath(key)
	对如 `a.b.c` 这类，会保证
    binding = {
        'a': 
        'a.b':
        'a.b.c': 
    }
    每层 path 都有一个 bindingIns # question
    只对第一层 path 调用 this.define(a, aKeyBinding)
```
- bindDirective 


```
find target compiler: traceOwnerCompiler
var binding
设置 subs
执行开发者的 bind hook
if computed
	call refresh
else
	call update
```

- markComputed
- define: Defines the getter/setter for a root-level binding on the VM

```
针对根成员，定义 getter/setter，另外 observables 也是在这里收集的

难点：
getter 会触发 'get' 事件，目前是为了依赖侦测，为了获得最『纯净』的底层依赖，
对以下类型不触发，因为以下类型的值肯定依赖更深的属性：isComputed value.__observer__ array 

setter
对于 computed 的，有 set 方法就直接用，没有就不管。
非 computed, 先移除旧的 observe，然后再设置新的的 observe
```

- bindContexts
- destroy

#### Directive

- Directive (directiveName, expression)

```
each definition
	this._update =
	this.xxx = xxx
parse key
parse filters
```

- update 值改变的时候会调用，只针对非 computed
- refresh 值改变的时候会调用，只针对 computed 成员，当所依赖发生改变时
- apply: Actually invoking the _update from the directive's definition

#### ExpParser from https://github.com/RubyLouvre/avalon 












