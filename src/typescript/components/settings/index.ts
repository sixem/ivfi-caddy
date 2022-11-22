/** Config */
import data from '../../config/data';
import { config, user } from '../../config/config';
/** Helpers */
import { DOM, capitalize, checkNested, getNestedPath } from '../../helpers';
/** Modules */
import { eventHooks } from '../../modules/event-hooks';
import { log } from '../../modules/logger';

/** Types */
import {
	MComponentSettings,
	TUserClient
} from '../../types';

/**
 * Structure functions (DOM)
 */
const create: MComponentSettings.TCreateCapsule = {};

/**
 * Update functions for settings which require live updating
 */
const update: MComponentSettings.TUpdateCapsule = {
	gallery: {}
};

/**
 * Handling of options
 */
const options: MComponentSettings.TOptionsCapsule = {};

/**
 * Creates a setting option
 */
create.option = (
	element: HTMLElement,
	text: string,
	options: {
		[key: string]: any;
	} = {},
	title: string = null) =>
{
	if(Object.prototype.hasOwnProperty.call(options, 'class'))
	{
		options.class = ('option ' + options.class);
	}

	const wrapperAttributes = Object.assign({
		class : 'option'
	}, options);

	const textAttributes: {
		class: string;
		text: string;
		title?: string;
	} = {
		class: 'option-text',
		text: text
	};

	if(title)
	{
		textAttributes.title = title;
	}

	/** Create wrapper */
	const wrapper = DOM.wrap(
		DOM.wrap(
			element, 'div'
		),
		'div', wrapperAttributes
	);

	/** Add to wrapper */
	wrapper.prepend(
		DOM.new('div', textAttributes) as HTMLElement
	);

	return wrapper;
};

/**
 * Creates a section
 */
create.section = (
	id: string,
	header: string = null) =>
{
	const container: HTMLElement = DOM.new('div', {
		'class': 'section',
		'data-key': id
	});

	container.appendChild(DOM.new('div', {
		class: 'header',
		text: header ? header : capitalize(id)
	}));

	return container;
};

/**
 * Creates a select option
 * 
 * Set options['data-key'] to override section key
 */
create.select = (
	values: Array<{
		value: string;
		text: string;
	}>,
	options: object = {},
	selected: any = null) =>
{
	const element = DOM.new(
		'select', options
	) as MComponentSettings.TIndexElement;

	values.map((value: {
		[key: string]: string;
	}, index: number) =>
	{
		value.text = capitalize(value.text);

		const option: HTMLOptionElement = DOM.new('option', value) as HTMLOptionElement;

		if(selected !== null)
		{
			if(selected(option, index, element) === true)
			{
				option.selected = true;
				element.selectedIndex = index;
			}
		}

		return option;
	}).forEach((value: HTMLElement) =>
	{
		element.appendChild(value);
	});

	return element;
};

/**
 * Creates a checkbox element
 */
create.check = (options, selected = null) =>
{
	const checked: boolean = (selected !== null) ? selected() : false;

	if(checked)
	{
		options.checked = '';
	}

	const checkbox = DOM.new('input', Object.assign(options, {
		type : 'checkbox'
	})) as HTMLInputElement;

	checkbox.checked = checked;

	return checkbox;
};

/**
 * Gallery update
 */
update.gallery.listAlignment = (alignment: number) =>
{
	if(data.instances.gallery)
	{
		/** Get any active gallery container */
		const parent = document.body.querySelector(
			':scope > div.rootGallery > div.galleryContent'
		);

		/** Apply list alignment to container */
		parent.classList[alignment === 0 ? 'remove' : 'add']('reversed');

		/** Get list and media container */
		const detached: HTMLDivElement = parent.querySelector(':scope > div.list');
		const media: HTMLDivElement = parent.querySelector(':scope > div.media');

		/** Remove list */
		parent.querySelector(':scope > div.list').remove();

		/** Insert aligned list */
		media.parentNode.insertBefore(
			detached, (alignment === 1) ? media : media.nextSibling
		);

		/** Apply options to gallery directly */
		data.instances.gallery.options.list.reverse = (
			alignment === 0 ? false : true
		);
	}
};

/**
 * Update reverse search option
 */
update.gallery.reverseOptions = (value: boolean) =>
{
	if(data.instances.gallery)
	{
		/** Set option directly in active gallery instance */
		data.instances.gallery.options.reverseOptions = value;

		const element: HTMLDivElement = document.body.querySelector(
			'div.rootGallery > div.galleryContent > \
			div.media > div.wrapper > div.cover .reverse'
		);

		if(element) element.remove();
	}
};

/**
 * Update fit content option
 */
update.gallery.fitContent = (value: boolean) =>
{
	if(data.instances.gallery)
	{
		/** Set option directly in active gallery instance */
		data.instances.gallery.options.fitContent = value;

		/* Get gallery wrapper */
		const wrapper: HTMLDivElement = document.body.querySelector(
			'div.rootGallery > div.galleryContent > div.media > div.wrapper'
		);

		if(wrapper && value)
		{
			wrapper.classList.add('fill');

			/* Force height recalculation */
			data.sets.refresh = true;
			data.sets.selected = null;

		} else if(wrapper)
		{
			wrapper.classList.remove('fill');

			/* Reset dimensions of wrapper elements */
			(['.cover', '.cover img', 'video']).forEach((selector: string) =>
			{
				DOM.style.set(wrapper.querySelector(selector), {
					height : '',
					width : ''
				});
			});
		}
	}
};

/**
 * Update gallery autoplay option
 * 
 * @param value new autoplay state
 */
update.gallery.autoplay = (value: boolean) =>
{
	if(data.instances.gallery)
	{
		/** Set option directly in active gallery instance */
		data.instances.gallery.options.autoplay = value;
	}
};

/**
 * Gathers set options
 * 
 * @param container settings container
 * @returns {object} object containing set options
 */
options.gather = (container: HTMLElement) =>
{
	const gathered: MComponentSettings.TGathered = {};

	/* Gather settings elements */
	const elements: NodeListOf<MComponentSettings.TIndexElement> =
		container.querySelectorAll(
			'select, input[type="checkbox"]'
		);

	/* Iterate over elements, get settings */
	elements.forEach((element: MComponentSettings.TIndexElement) =>
	{
		if(element.hasAttribute('name'))
		{
			const id: string = element.getAttribute('name');

			/** Get section identifier */
			const section: string = element.hasAttribute('data-key')
				? element.getAttribute('data-key')
				: element.closest('.section').getAttribute('data-key');

			if(!Object.prototype.hasOwnProperty.call(gathered, section))
			{
				gathered[section] = {};
			}

			if(element.tagName === 'SELECT')
			{
				let setValue = (element.selectedIndex)
				gathered[section][id] = setValue;

			} else if(element.tagName === 'INPUT'
				&& element.getAttribute('type').toUpperCase() === 'CHECKBOX')
			{
				gathered[section][id] = element.checked;
			}
		}
	});

	return gathered;
};

/**
 * Applies the settings passed to the function
 * 
 * @param setData settings to apply
 * @param client user client instance
 * @returns {object} an object containing the changed settings
 */
options.set = (setData: object, client: TUserClient) =>
{
	client = client || user.get();

	Object.keys(setData).forEach((key) =>
	{
		const isMain: boolean = (key === 'main');

		if(!isMain && !Object.prototype.hasOwnProperty.call(client, key))
		{
			client[key] = {};
		}

		Object.keys(setData[key]).forEach((option) =>
		{
			let value = setData[key][option];

			/** Check if the option has changed, and if so, flag it for updating */
			const changed: boolean = (isMain
				? (client[option] !== value)
				: (client[key][option] !== value)
			);

			/** Recreate object - set changed state and value */
			setData[key][option] = {
				value, changed
			};

			if(isMain)
			{
				client[option] = value;
			} else {
				client[key][option] = value;
			}

			if(changed)
			{
				/* Call any live updating functions for the changed setting */
				if(isMain
					&& Object.prototype.hasOwnProperty.call(update, option))
				{
					update[option](value);
				} else if(checkNested(update, key, option))
				{
					update[key][option](value);
				}
			}
		});
	});

	log('settings', 'Set settings:', setData);

	/** Save settings to client */
	user.set(client);

	return setData;
};

export class componentSettings
{
	private client: TUserClient;

	private boundEvents: {
		selector?: any;
		events?: Array<string>;
	}

	constructor()
	{
		return this;
	}

	/**
	 * Apply settings (gather and set settings, then close menu)
	 */
	apply = (element: HTMLElement, client: TUserClient): void =>
	{
		client = client || user.get();

		options.set(options.gather(element), client);

		/** Call functions on settings applied */
		data.components.settings.close();
		data.layer.main.update();
	}

	/**
	 * Close settings menu
	 */
	close = (): void =>
	{
		/** Remove events */
		Object.keys(this.boundEvents).forEach((eventId: string) =>
		{
			const { selector, events } = this.boundEvents[eventId];

			/** Unlisten to events */
			eventHooks.unlisten(selector, events, eventId);
		});

		this.boundEvents = {};

		/** Remove settings elements */
		document.body.querySelectorAll(
			':scope > div.focusOverlay, :scope > div.settingsContainer'
		).forEach((element) => element.remove());
	}

	getSectionGallery = (section = create.section('gallery'), settings = 0) =>
	{
		if(!config.get('mobile'))
		{
			section.append(create.option(
				create.select(['right', 'left'].map((alignment: string) =>
				{
					return {
						value: ('align-' + alignment),
						text: alignment
					};
				}), {
					name : 'listAlignment'
				}, (option: any, index: number) =>
				{
					return (index === this.client.gallery.listAlignment);
				}), data.text.settingsLabels.galleryListAlignment.text)
			);

			settings++;
		}

		const sets = [];

		sets.push([
			data.text.settingsLabels.galleryReverseSearch.text,
			'reverseOptions',
			data.text.settingsLabels.galleryReverseSearch.description
		]);

		sets.push([
			data.text.settingsLabels.galleryVideoAutoplay.text,
			'autoplay',
			data.text.settingsLabels.galleryVideoAutoplay.description
		]);

		sets.push([
			data.text.settingsLabels.galleryFitContent.text,
			'fitContent',
			data.text.settingsLabels.galleryFitContent.description
		]);

		sets.forEach((e) =>
		{
			const [label, key, description] = e;

			section.append(create.option(
				create.check({
					name : key
				}, () =>
				{
					return checkNested(this.client, 'gallery', key)
						? (this.client.gallery[key])
						: config.get(`gallery.${key}`);
				}), label, {
					class : 'interactable'
				}, description)
			);

			settings++;
		});

		return {
			settings,
			section
		};
	}

	removeOnUnbind = ({ selector, events, id }) =>
	{
		this.boundEvents[id] = {
			selector, events
		};
	}

	/**
	 * Create and show the settings menu
	 */
	show = () =>
	{
		if(document.body.querySelector(':scope > div.settingsContainer'))
		{
			return;
		}

		this.client = user.get();
		this.boundEvents = {};

		const sections = [];

		if(!document.body.querySelector(':scope > div.focusOverlay'))
		{
			const overlay = DOM.new('div', {
				class : 'focusOverlay'
			});

			document.body.appendChild(overlay);

			eventHooks.listen(overlay, 'click', 'settingsOverlayClick', () =>
			{
				data.components.settings.close();
			}, {
				onAdd: this.removeOnUnbind
			});
		}

		const container = DOM.new('div', {
			class : 'settingsContainer'
		});

		if(config.get('gallery.enabled'))
		{
			sections.push(this.getSectionGallery());
		}

		const wrapper = DOM.new('div', {
			class : 'wrapper'
		});

		wrapper.append(...sections.map((item) =>
		{
			return item.settings > 0 ? item.section : null;
		}).filter((item) =>
		{
			return item !== null;
		}));

		const bottom = DOM.new('div', {
			class : 'bottom'
		});

		const applyButton = DOM.new('div', {
			class : 'apply ns',
			text : 'Apply'
		});

		const cancelButton = DOM.new('div', {
			class : 'cancel ns',
			text : 'Cancel'
		});

		container.append(wrapper, bottom);

		/* Add `Apply` and `Cancel` buttons and add callbacks on `click` */
		[[applyButton, 'settignsApplyClick', () => this.apply(container, this.client)],
			[cancelButton, 'settingsCancelClick', () => this.close()]
		].forEach(([ element, id, callback ]) =>
		{
			bottom.append(element as Node);

			eventHooks.listen(element as HTMLElement, 'click', id.toString(), callback as (...args: any) => void, {
				onAdd: this.removeOnUnbind
			});
		});

		document.body.appendChild(container);

		container.querySelectorAll('div.section > .option.interactable').forEach((option, index) =>
		{
			eventHooks.listen(option as HTMLElement, 'mouseup', `settingsMouseUp_${index}`, (e) =>
			{
				if(window.getSelection().toString())
				{
					return;
				}

				if(e.target.tagName !== 'INPUT')
				{
					const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');

					if(checkbox)
					{
						checkbox.checked = !checkbox.checked;

						return;
					}
				}
			}, {
				onAdd: this.removeOnUnbind
			});
		});
	}
}