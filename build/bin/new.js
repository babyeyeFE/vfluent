console.log()
process.on('exit', () => {
  console.log()
})

if (!process.argv[2]) {
  console.error('[组件名]必填 - Please enter new component name')
  process.exit(1)
}

const path = require('path')
const fileSave = require('file-save')
const uppercamelcase = require('uppercamelcase')

const componentname = process.argv[2]
const chineseName = process.argv[3] || componentname
const ComponentName = uppercamelcase(componentname)
const PackagePath = path.resolve(__dirname, '../../components', componentname)
const Files = [
  {
    filename: 'index.js',
    content: `import ${ComponentName} from './${ComponentName}';

/* istanbul ignore next */
${ComponentName}.install = function(Vue) {
  Vue.component(${ComponentName}.name, ${ComponentName});
};

export default ${ComponentName};`
  },
  {
    filename: `${ComponentName}.vue`,
    content: `<template>
  <div class="vup-${componentname}"></div>
</template>

<script>
export default {
  name: 'Vup${ComponentName}'
};
</script>`
  },

  {
    filename: path.join('../../docs/components', `${componentname}.md`),
    content: `## ${ComponentName}`
  },
  {
    filename: path.join('../../test/unit/specs', `${componentname}.spec.js`),
    content: `import { createTest, destroyVM } from '../util';
import ${ComponentName} from 'components/${componentname}';

describe('${ComponentName}', () => {
  let vm;
  afterEach(() => {
    destroyVM(vm);
  });

  it('create', () => {
    vm = createTest(${ComponentName}, true);
    expect(vm.$el).to.exist;
  });
});
`
  }
]

// 添加到 components.json
const componentsFile = require('../../components.json')

if (componentsFile[componentname]) {
  console.error(`${componentname} 已存在.`)
  process.exit(1)
}
componentsFile[componentname] = `./components/${componentname}/index.js`
fileSave(path.join(__dirname, '../../components.json'))
  .write(JSON.stringify(componentsFile, null, '  '), 'utf8')
  .end('\n')

// 创建 package
Files.forEach((file) => {
  fileSave(path.join(PackagePath, file.filename))
    .write(file.content, 'utf8')
    .end('\n')
})

// 添加到 nav.config.json
const navConfigFile = require('../../docs/.vuepress/sidebar.conf.json')

navConfigFile.push(`/components/${componentname}`)
// Object.keys(navConfigFile).forEach((lang) => {
//   const groups = navConfigFile[lang][4].groups
//   groups[groups.length - 1].list.push({
//     path: `/${componentname}`,
//     title:
//       lang === 'zh-CN' && componentname !== chineseName
//         ? `${ComponentName} ${chineseName}`
//         : ComponentName
//   })
// })

fileSave(path.join(__dirname, '../../docs/.vuepress/sidebar.conf.json'))
  .write(JSON.stringify(navConfigFile, null, '  '), 'utf8')
  .end('\n')

console.log('DONE!')
