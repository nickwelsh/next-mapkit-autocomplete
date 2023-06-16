'use client'
import { Combobox, ComboboxInput, ComboboxList, ComboboxOption, ComboboxPopover } from '@reach/combobox'
import '@reach/combobox/styles.css'
import { ChangeEvent, use, useEffect, useState } from 'react'
import { api } from '@/trpc/client'
import { Label } from '@/components/ui/label'

export type MapKitResults<T> = {
	results: T[]
}

export type Location = {
	latitude: number
	longitude: number
}

export type AutocompleteResult = {
	completionUrl: string
	displayLines: string[]
	location: Location
	structuredAddress: StructuredAddress
}

export type StructuredAddress = {
	administrativeArea: string
	administrativeAreaCode?: string
	areasOfInterest: string[]
	dependentLocalities: string[]
	fullThoroughfare: string
	locality: string
	postCode: string
	subLocality: string
	subThoroughfare: string
	thoroughfare: string
}

export default function Autocomplete() {
	const authToken = use(api.mapkitAuthToken.query())

	function Example() {
		const [query, setQuery] = useState('')
		const suggestions = useAddressAutocomplete(query)
		const handleSearchTermChange = (event: ChangeEvent<HTMLInputElement>) => {
			setQuery(event.target.value)
		}

		return (
			<Combobox aria-label='Address' className='grid w-full max-w-sm items-center gap-1.5'>
				<Label htmlFor='address'>Address</Label>
				<ComboboxInput
					id='address'
					className='flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
					onChange={handleSearchTermChange}
				/>
				<p className='text-sm text-muted-foreground'>Start typing your address to autocomplete.</p>
				{suggestions && (
					<ComboboxPopover className='z-50 max-h-[calc(100vh_-_12rem)] w-72 overflow-scroll rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'>
						{suggestions.length > 0 ? (
							<ComboboxList className='flex flex-col gap-2'>
								{suggestions.map(suggestion => {
									const string_ = `${suggestion.displayLines.join(', ')}`
									return (
										<ComboboxOption className='rounded-md' key={string_} value={string_}>
											<div className='grid grid-cols-[auto_1fr] gap-2'>
												<div className='mt-1 grid h-8 w-8 flex-grow place-items-center rounded-full bg-red-500 text-white'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														viewBox='0 0 24 24'
														fill='currentColor'
														className='h-5 w-5'
													>
														<path
															fillRule='evenodd'
															d='M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z'
															clipRule='evenodd'
														/>
													</svg>
												</div>
												<div className='flex flex-col'>
													<span className='font-bold'>{suggestion.displayLines[0]}</span>
													<span className='text-sm text-gray-500'>
														{suggestion.displayLines.slice(1).join(', ')}{' '}
													</span>
												</div>
											</div>
										</ComboboxOption>
									)
								})}
							</ComboboxList>
						) : (
							<span style={{ display: 'block', margin: 8 }}>No results found</span>
						)}
					</ComboboxPopover>
				)}
			</Combobox>
		)
	}

	function useAddressAutocomplete(query: string) {
		const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([])

		useEffect(() => {
			let isFresh = true
			if (query.trim() !== '') {
				fetchSuggestions(query).then(suggestions => {
					if (isFresh) setSuggestions(suggestions.results)
				})
			}
			return () => {
				isFresh = false
			}
		}, [query])

		return suggestions
	}

	type Cache = {
		[query: string]: MapKitResults<AutocompleteResult> // or replace `any` with a more specific type if known
	}

	const cache: Cache = {}
	function fetchSuggestions(query: string) {
		if (cache[query]) {
			return Promise.resolve(cache[query])
		}
		return fetch(`https://maps-api.apple.com/v1/searchAutocomplete?q=${encodeURIComponent(query)}`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		})
			.then(response => response.json())
			.then(result => {
				cache[query] = result as MapKitResults<AutocompleteResult>
				return result as MapKitResults<AutocompleteResult>
			})
	}

	return <Example />
}
