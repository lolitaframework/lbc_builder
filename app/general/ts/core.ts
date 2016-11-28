/// <reference path='../def/jquery.d.ts' />

namespace LolitaFramework {

	/**
	 * Breakpoint interface
	 */
	export interface Breakpoint {
		name: string,
		upValue: number
	}

	/**
	 * Block generic Class
	 */
	export abstract class Block {
		/**
		 * Block object
		 * @type {JQuery}
		 */
		protected block: JQuery;

		/**
		 * Block selector
		 * @type {string}
		 */
		protected blockSelector: string;

		/**
		 * Constructor
		 */
		constructor(blockSelector: string) {
			this.blockSelector = blockSelector;
			this.block = jQuery(blockSelector);

			if (!this.block.length) {
				console.warn('There is no any blocks with selector: ' + this.blockSelector);
			}
		}
	}

	/**
	 * MediaBreakpoints supporting
	 */
	export abstract class MediaBreakpoints extends Block {

		/**
		 * Array of device types
		 * @type {Array}
		 */
		protected static mediaBreakpoints: Array<Breakpoint> = ;

		/**
		 * Current device type
		 * @type {Breakpoint}
		 */
		protected static currentDeviceType: Breakpoint;

		/**
		 * Constructor
		 */
		constructor(blockSelector: string) {
			super(blockSelector);
			jQuery(window).on('resize', 
				() => {
					this.onResize();
				}
			);
			this.onResize();
		}

		/**
		 * On breakpoint changed
		 */
		protected abstract onBreakpointChange(breakpoint: Breakpoint): void;

		/**
		 * On screen resize
		 */
		protected onResize() {
			MediaBreakpoints.mediaBreakpoints = MediaBreakpoints.mediaBreakpoints.sort((a, b): number => {
				if (b.upValue > a.upValue) {
					return 1;
				} else if (b.upValue < a.upValue) {
					return -1;
				} else {
					return 0;
				}
			});

			let currentWidth: number = <number>jQuery(window).width();
			let currentDeviceType: Breakpoint;

			for (let breakpoint of MediaBreakpoints.mediaBreakpoints) {
				if (currentWidth <= breakpoint.upValue) {
					currentDeviceType = breakpoint;
				} else {
					break;
				}
			}

			if (currentDeviceType != MediaBreakpoints.currentDeviceType) {
				MediaBreakpoints.currentDeviceType = currentDeviceType;
				this.onBreakpointChange(currentDeviceType);
				if (currentDeviceType == undefined) {
					console.warn('Current device type is undefined');
				} else {
					console.info('Current device type is: ' + MediaBreakpoints.currentDeviceType.name);
				}
			}
		}

		/**
		 * Added breakpoint to mediaBreakpoints value
		 * @param {Breakpoint} breakpoint description
		 */
		public static addMediaBreakpoin(breakpoint: Breakpoint): void {
			if (!breakpoint.name) {
				throw new RangeError('Breakpoint label should be not empty');				
			}
			if (breakpoint.upValue < 1) {
				throw new RangeError('Breakpoint upValue should be positive');
			}
			MediaBreakpoints.mediaBreakpoints.push(breakpoint);
		}
	}
}
