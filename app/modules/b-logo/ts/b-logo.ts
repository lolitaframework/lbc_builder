/// <reference path='../../../general/def/jquery.d.ts' />
/// <reference path='../../../general/ts/core.ts' />

namespace LolitaFramework {
	export class bLogo extends LolitaFramework.MediaBreakpoints {
		constructor(blockName: string) {
			super(blockName);
		}
		protected onBreakpointChange(breakpoint: Breakpoint) {
			
		}
	}

	let logo = new bLogo('.b-logo');
}