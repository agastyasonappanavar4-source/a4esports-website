"use client";

import { Bell, Clock3, Trophy, X } from "lucide-react";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    title: "Weekly BR Championship",
    message: "Registration is now open.",
    time: "2 min ago",
    color: "bg-green-500",
  },
  {
    id: 2,
    title: "Room ID Released",
    message: "Your room details are now available.",
    time: "15 min ago",
    color: "bg-orange-500",
  },
  {
    id: 3,
    title: "Payment Successful",
    message: "Your tournament slot has been confirmed.",
    time: "1 hour ago",
    color: "bg-blue-500",
  },
  {
    id: 4,
    title: "Winner Announced",
    message: "Congratulations Team Alpha!",
    time: "Yesterday",
    color: "bg-purple-500",
  },
];

export default function NotificationPanel({
  open,
  onClose,
}: NotificationPanelProps) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-screen w-[400px] bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b p-6">

          <div className="flex items-center gap-3">

            <Bell className="text-orange-500" />

            <div>

              <h2 className="text-2xl font-black">
                Notifications
              </h2>

              <p className="text-sm text-gray-500">
                Latest updates
              </p>

            </div>

          </div>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="space-y-4 overflow-y-auto p-5">

          {notifications.map((item) => (

            <div
              key={item.id}
              className="rounded-2xl border p-5 transition hover:border-orange-400 hover:bg-orange-50"
            >

              <div className="flex items-start justify-between">

                <div className="flex gap-3">

                  <div
                    className={`mt-1 h-3 w-3 rounded-full ${item.color}`}
                  />

                  <div>

                    <h3 className="font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-gray-600">
                      {item.message}
                    </p>

                  </div>

                </div>

                <Trophy size={18} className="text-orange-500" />

              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">

                <Clock3 size={14} />

                {item.time}

              </div>

            </div>

          ))}

        </div>

      </aside>
    </>
  );
}