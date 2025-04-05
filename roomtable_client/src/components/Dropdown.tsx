// https://tailwindcss.com/plus/ui-blocks/application-ui/elements/dropdowns
import { Menu, Transition, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import handleLogout from './Logout'

export default function UserDropdown() {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50">
          Menu
          <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
        </MenuButton>
      </div>
    
    <Transition
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
    >
    <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-none">
        {/* Group 1: App Pages */}
        <div className="py-1">
          <MenuItem>
            <a
              href="/homepage"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Saved Rooms
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="/friends"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Friends
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="/search"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Search
            </a>
          </MenuItem>
          <MenuItem>
            <a
              href="/review"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Reviews
            </a>
          </MenuItem>
        </div>

        {/* Group 2: Log Out */}
        <div className="py-1">
          <MenuItem>
            <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
                Log Out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
      </Transition>
    </Menu>
  )
}
