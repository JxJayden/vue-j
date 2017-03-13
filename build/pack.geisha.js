import buble from 'rollup-plugin-buble';
import { Banner } from './pack.banner';

export default {
	entry: './src/main/index.js',
	dest: './dist/geisha.js',
	format: 'umd',
	moduleName: 'Geisha',
	banner: Banner,
	plugins: [
		buble()
	]
}