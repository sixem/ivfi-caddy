/** Config */
import selectorClass from '../../classes/selector';
import { config } from '../../config/config';
import data from '../../config/data';

/** Types */
import {
	TComponentFilter,
	TOptimizeRowItem
} from '../../types';

const componentFilter: TComponentFilter = {},
	selector: selectorClass = data.instances.selector;

/**
 * Filter types
 */
type TFilterData = {
	reset?: boolean;
	total?: number;
	shown?: {
		directories: number;
		files: number;
	};
};

componentFilter.apply = (query = ''): void =>
{
	const filterData: TFilterData = {};
	let errorData: any = false;

	data.sets.refresh = true;

	filterData.reset = query === '' || !query;

	filterData.shown = {
		directories: 0,
		files: 0
	};

	filterData.total = 0;

	/* Reset stored gallery index if active */
	if(data.instances.gallery)
	{
		data.instances.gallery.data.selected.index = 0;
	}

	/* Check if optimizer is being used */
	const useOptimizer = Object.prototype.hasOwnProperty.call(data.instances.optimize, 'main')
		&& data.instances.optimize.main.enabled;

	/* Fetch rows from optimizer class if set */
	let rows: NodeListOf<TOptimizeRowItem> = useOptimizer ? data.instances.optimize.main.rows : null;

	/* If no stored rows were found, fetch them directly instead */
	if(rows === null)
	{
		rows = (selector.use('TABLE') as HTMLElement).querySelectorAll(
			'tbody > tr'
		) as NodeListOf<HTMLElement>;
	}

	/* Iterate over rows and search for query */
	for(let i = 1; i < rows.length; i++)
	{
		const item = rows[i];

		if(filterData.reset === true)
		{
			item.classList.remove('filtered');
			if(useOptimizer) data.instances.optimize.main.setVisibleFlag(item, true);

			continue;
		}

		const is = { file : false, directory : false };

		if(item.classList.contains('file'))
		{
			is.file = true;
		} else if(item.classList.contains('directory'))
		{
			is.directory = true;
		}

		const match = componentFilter.getMatch(item.children[0].getAttribute('data-raw'), query);

		if(match.valid && match.data)
		{
			item.classList.remove('filtered');

			/* Set visible flag in optimizer */
			if(useOptimizer)
			{
				data.instances.optimize.main.setVisibleFlag(item, true);					
			}

			/** Append++ to file or directory count */
			if(is.file) filterData.shown.files++;
			else if(is.directory) filterData.shown.directories++;

		} else if(match && match.valid === false)
		{
			errorData = match.reason;
		} else {
			item.classList.add('filtered');

			/* Set visible flag in optimizer */
			if(useOptimizer)
			{
				data.instances.optimize.main.setVisibleFlag(item, false);
			}
		}

		/* Add size to total */
		if((match.valid && match.data && (is.file || is.directory)))
		{
			filterData.total++;
		}
	}

	/* Set parent class so that we can hide all - .filtered -> .filtered */
	if(filterData.reset)
	{
		(selector.use('TABLE_CONTAINER') as HTMLElement).removeAttribute(
			'is-active-filter'
		);
	} else {
		(selector.use('TABLE_CONTAINER') as HTMLElement).setAttribute(
			'is-active-filter', ''
		);

		/* Scroll to top on search */
		window.scrollTo(0, 0);
	}

	if(useOptimizer)
	{
		/* Call optimization refactoring as we've made changes */
		data.instances.optimize.main.refactor();
	}

	interface ITop {
		container: HTMLElement;
		total?: {
			textContent: string;
		};
		files?: {
			textContent: string;
		};
		directories?: {
			textContent: string;
		};
	}

	const top: ITop = {
		container: document.body.querySelector(':scope > div.topBar')
	};

	/* Retrieve values */
	(['total', 'files', 'directories']).forEach((key: string) =>
	{
		top[key] = top.container.querySelector(`[data-count="${key}"]`);
	});

	/* Defaulting */
	if(!Object.prototype.hasOwnProperty.call(data.sets.defaults, 'topValues'))
	{
		data.sets.defaults.topValues = {
			total: top.total.textContent,
			files: top.files.textContent,
			directories: top.directories.textContent
		};
	}

	/* Set total text content */
	top.total.textContent = (filterData.reset)
		? data.sets.defaults.topValues.total
		: `${filterData.total} of ${data.sets.defaults.topValues.total}`;

	/* Set files text content */
	top.files.textContent =
		(filterData.reset) ? data.sets.defaults.topValues.files : 
			`${filterData.shown.files} file${filterData.shown.files === 1 ? '' : 's'}`;

	/* Set directories text content */
	top.directories.textContent =
		(filterData.reset) ? data.sets.defaults.topValues.directories : 
			`${filterData.shown.directories} ${filterData.shown.directories === 1 ? 'directory' : 'directories'}`;

	const option: HTMLElement = document.body.querySelector(':scope > div.menu > #gallery');

	const previews = (selector.use('TABLE_CONTAINER') as HTMLElement).querySelectorAll(
		'table tr.file:not(.filtered) a.preview'
	).length;

	if(errorData !== false)
	{
		console.error(`Filter regex error: ${errorData}`);
	}

	/* Hide or show the gallery menu option */
	if(!filterData.reset && previews === 0 && option)
	{
		if(option.style.display !== 'none')
		{
			option.style.display = 'none';
		}
	} else if((previews > 0 || filterData.reset) && option)
	{
		if(option.style.display === 'none')
		{
			option.style.display = 'block';
		}
	}
};

componentFilter.getMatch = (input: string, query: string) =>
{
	const match: ReturnType<TComponentFilter['getMatch']> = {};

	try
	{
		match.valid = true;
		match.data = (input).match(new RegExp(query, 'i'));
	} catch(exception: unknown)
	{
		match.valid = false;
		match.reason = exception;
	}

	return match;
};

componentFilter.toggle = (): void =>
{
	const container: HTMLElement = document.body.querySelector(
		':scope > div.filterContainer'
	);

	const input: HTMLInputElement = container.querySelector(
		'input[type="text"]'
	);

	if(container.style.display !== 'none')
	{
		container.style.display = 'none';
	} else {
		input.value = '';
		componentFilter.apply(null);
		container.style.display = 'block';
	}

	input.focus();
};

export {
	componentFilter
};