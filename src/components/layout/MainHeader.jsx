import { useRef, useCallback, useState } from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { HEADER_BG, NAV_ACTIVE, NAV_TABS } from "../../utils/constants.js";
import { useAppStore } from "../../store/useAppStore.js";
import { useClickOutside } from "../../hooks/useClickOutside.js";
import { logger } from "../../utils/logger.js";
import Logo from "../../assets/logo.png";

export function MainHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeNavTab = useAppStore((s) => s.activeNavTab);
  const setActiveNavTab = useAppStore((s) => s.setActiveNavTab);

  const notificationsOpen = useAppStore((s) => s.notificationsOpen);
  const toggleNotifications = useAppStore((s) => s.toggleNotifications);
  const closeNotifications = useAppStore((s) => s.closeNotifications);

  const profileMenuOpen = useAppStore((s) => s.profileMenuOpen);
  const toggleProfileMenu = useAppStore((s) => s.toggleProfileMenu);
  const closeProfileMenu = useAppStore((s) => s.closeProfileMenu);

  const openSettings = useAppStore((s) => s.openSettings);
  const showToast = useAppStore((s) => s.showToast);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const onCloseNotif = useCallback(() => {
    closeNotifications();
  }, [closeNotifications]);

  const onCloseProfile = useCallback(() => {
    closeProfileMenu();
  }, [closeProfileMenu]);

  useClickOutside(notifRef, notificationsOpen, onCloseNotif);
  useClickOutside(profileRef, profileMenuOpen, onCloseProfile);

  return (
    <header
      className="flex h-16 items-center px-4 md:px-6 relative"
      style={{ backgroundColor: HEADER_BG }}
    >
      <div className="flex items-center min-w-[120px]">
        <img
          src={Logo}
          alt="Natureland Wellness Group"
          className="h-10 cursor-pointer"
          onClick={() => {
            setActiveNavTab("home");
            logger.action("nav.logo", { tab: "home" });
          }}
        />
      </div>
      <div className="hidden md:flex flex-1 justify-end">
        <nav className="flex items-center gap-8 mr-5">
          {NAV_TABS.map((item) => (
            <a
              key={item.id}
              href="#"
              className="text-[14px] font-medium"
              style={{
                color: activeNavTab === item.id ? NAV_ACTIVE : "#bfbfbf",
                fontWeight: "bold",
              }}
              onClick={(e) => {
                e.preventDefault();
                setActiveNavTab(item.id);
                logger.action("nav.tab", { tab: item.id });
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu />
        </button>
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/10"
            onClick={toggleNotifications}
            style={{
              color: "#bfbfbf",
              fontWeight: "bold",
            }}
          >
            <Bell className="h-5 w-5" />
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50">
              <div className="px-3 py-2 font-semibold text-sm border-b">
                Notifications
              </div>
              <button
                className="w-full px-3 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  showToast("Booking reminder: 2 upcoming");
                  closeNotifications();
                }}
              >
                Booking reminder: 2 upcoming today
              </button>
              <button
                className="w-full px-3 py-2 text-left hover:bg-gray-100"
                onClick={() => {
                  showToast("System: schedule published");
                  closeNotifications();
                }}
              >
                Schedule published for next week
              </button>
            </div>
          )}
        </div>
        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-1"
            onClick={toggleProfileMenu}
          >
            <span className="h-9 w-9 rounded-full overflow-hidden bg-gray-500">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </span>
            <ChevronDown className="text-white w-4 h-4" />
          </button>
          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl z-50">
              <button
                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  openSettings();
                  closeProfileMenu();
                }}
              >
                Settings
              </button>
              <button
                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                onClick={() => {
                  showToast("Signed out", "success");
                  closeProfileMenu();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden z-40">
          {NAV_TABS.map((item) => (
            <a
              key={item.id}
              href="#"
              className="block px-4 py-3 border-b text-sm"
              onClick={(e) => {
                e.preventDefault();
                setActiveNavTab(item.id);
                setMobileMenuOpen(false);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
