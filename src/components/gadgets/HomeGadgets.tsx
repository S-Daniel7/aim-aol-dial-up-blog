import { Clock } from "@/components/gadgets/Clock";
import { DialUpStatus } from "@/components/gadgets/DialUpStatus";
import { GuestbookTicker } from "@/components/gadgets/GuestbookTicker";
import { VisitorMap } from "@/components/gadgets/VisitorMap";
import { WeatherNote } from "@/components/gadgets/WeatherNote";
import { NowPlayingWidget } from "@/components/NowPlayingWidget";
import type { GuestbookEntry } from "@/lib/types";
import type { VisitorCount } from "@/lib/visitors-db";
import type { Weather } from "@/lib/weather";

type Props = {
  weather: Weather | null;
  guestbook: GuestbookEntry[];
  visitors: VisitorCount[];
};

function LeftGadgets({ weather }: { weather: Weather | null }) {
  return (
    <>
      <Clock />
      <DialUpStatus />
      <WeatherNote weather={weather} />
    </>
  );
}

function RightGadgets({ guestbook, visitors }: Omit<Props, "weather">) {
  return (
    <>
      <NowPlayingWidget />
      <GuestbookTicker entries={guestbook} />
      <VisitorMap initial={visitors} />
    </>
  );
}

/**
 * Ambient "desktop gadget" widgets. On wide (2xl) screens they pin to the
 * empty margins as fixed side rails; below that they flow inline in a grid so
 * nothing is lost on smaller screens.
 */
export function HomeGadgets({ weather, guestbook, visitors }: Props) {
  return (
    <>
      {/* Inline grid — small/medium screens */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:hidden">
        <LeftGadgets weather={weather} />
        <RightGadgets guestbook={guestbook} visitors={visitors} />
      </section>

      {/* Fixed left rail — wide screens */}
      <aside className="hidden 2xl:fixed 2xl:top-28 2xl:left-4 2xl:flex 2xl:w-52 2xl:max-h-[calc(100vh-8rem)] 2xl:flex-col 2xl:gap-3 2xl:overflow-y-auto 2xl:pb-4">
        <LeftGadgets weather={weather} />
      </aside>

      {/* Fixed right rail — wide screens */}
      <aside className="hidden 2xl:fixed 2xl:top-28 2xl:right-4 2xl:flex 2xl:w-52 2xl:max-h-[calc(100vh-8rem)] 2xl:flex-col 2xl:gap-3 2xl:overflow-y-auto 2xl:pb-4">
        <RightGadgets guestbook={guestbook} visitors={visitors} />
      </aside>
    </>
  );
}
