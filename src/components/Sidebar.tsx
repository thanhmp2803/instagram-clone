'use client'
import Image from 'next/image'
import { createSidebarItems } from '@mocks'

export function Sidebar() {
  const allItems = createSidebarItems()

  // Tách các items theo vị trí
  const filterMainItems = () =>
    allItems.filter((item) => !['More', 'Also from Meta'].includes(item.label))
  const filterBottomItems = () =>
    allItems.filter((item) => ['More', 'Also from Meta'].includes(item.label))

  return (
    <div className="h-screen w-[250px] bg-black text-white flex flex-col justify-between p-4 border-r border-e-zinc-700">
      {/* Logo and Main Menu */}
      <div>
        <h1 className="text-3xl font-instagram mb-8 ms-2 cursor-pointer">Instagram</h1>

        <nav className="flex flex-col space-y-6">
          {filterMainItems().map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                className="flex items-center space-x-4 hover:bg-zinc-800 p-2 rounded-lg transition cursor-pointer"
              >
                <Icon size={24} />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}

          {/* Profile */}
          <button className="flex items-center space-x-4 hover:bg-zinc-800 p-2 rounded-lg transition cursor-pointer">
            <Image
              src="/images/conmeo.jpg"
              alt="Profile"
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
            <span className="font-medium">Profile</span>
          </button>
        </nav>
      </div>

      {/* Bottom Menu - More and Also from Meta */}
      <div className="flex flex-col space-y-6">
        {filterBottomItems().map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              className="flex items-center space-x-4 hover:bg-zinc-800 p-2 rounded-lg transition cursor-pointer"
            >
              <Icon size={24} />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
