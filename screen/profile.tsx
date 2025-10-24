import { useAtomValue } from "jotai";
import { useRouter } from "expo-router";
import { useState, useMemo, useCallback } from "react";
import { View, FlatList, TouchableOpacity, ScrollView } from "react-native";

import { Text } from "@/components/ui";
import { eventsAtom, requestsAtom } from "@/state/atoms";
import { useAuth, useCurrentUserEvents } from "@/hooks/useModule";

type TabType = "created" | "joined" | "pending";

export const ProfileScreen = () => {
  const { currentUser, logout } = useAuth();
  const userEvents = useCurrentUserEvents();
  const [activeTab, setActiveTab] = useState<TabType>("created");
  const router = useRouter();

  const allEvents = useAtomValue(eventsAtom);
  const allRequests = useAtomValue(requestsAtom);

  const createdEvents = useMemo(
    () =>
      userEvents.createdEvents
        .map(eventId => allEvents.get(eventId))
        .filter((event): event is SportingEvent => event !== undefined),
    [userEvents.createdEvents, allEvents],
  );

  const joinedEvents = useMemo(
    () =>
      userEvents.joinedEvents
        .map(eventId => allEvents.get(eventId))
        .filter((event): event is SportingEvent => event !== undefined),
    [userEvents.joinedEvents, allEvents],
  );

  const pendingRequestsWithEvents = useMemo(
    () =>
      userEvents.pendingRequests
        .map(requestId => {
          const request = allRequests.get(requestId);
          if (!request) return null;
          const event = allEvents.get(request.eventId);
          if (!event) return null;
          return { event, request };
        })
        .filter((item): item is { request: JoinRequest; event: SportingEvent } => item !== null),
    [userEvents.pendingRequests, allRequests, allEvents],
  );

  const formatDate = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleString("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
    });
  }, []);

  const getEventStatus = useCallback((event: SportingEvent): string => {
    const now = Date.now();
    if (event.startTime > now) return "Upcoming";
    if (event.endTime > now) return "In Progress";
    return "Completed";
  }, []);

  const getParticipantCount = useCallback(
    (eventId: string): number => {
      return Array.from(allRequests.values()).filter(req => req.eventId === eventId && req.status === "ACCEPTED")
        .length;
    },
    [allRequests],
  );

  const renderEventCard = useCallback(
    ({ item: event }: { item: SportingEvent }) => {
      const status = getEventStatus(event);
      const acceptedCount = getParticipantCount(event.id);

      return (
        <TouchableOpacity
          className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50"
          onPress={() => router.push(`/event-detail?eventId=${event.id}`)}
        >
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-bold flex-1 text-gray-900">{event.title}</Text>
            <View
              className={`px-3 py-1 rounded-full ${
                status === "Upcoming" ? "bg-blue-100" : status === "In Progress" ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  status === "Upcoming"
                    ? "text-blue-700"
                    : status === "In Progress"
                      ? "text-green-700"
                      : "text-gray-700"
                }`}
              >
                {status}
              </Text>
            </View>
          </View>

          <View className="space-y-1 mb-3">
            <Text className="text-sm text-gray-600">🏆 {event.sport}</Text>
            <Text className="text-sm text-gray-600">📍 {event.location}</Text>
            <Text className="text-sm text-gray-600">🕐 {formatDate(event.startTime)}</Text>
          </View>

          <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-500">
              Players: {acceptedCount}/{event.maxPlayers}
            </Text>
            <Text className="text-xs text-gray-400">Created {formatDate(event.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [formatDate, getEventStatus, getParticipantCount, router],
  );

  const renderPendingRequestCard = useCallback(
    ({ item }: { item: { request: JoinRequest; event: SportingEvent } }) => {
      const { event, request } = item;
      const status = getEventStatus(event);

      return (
        <TouchableOpacity
          className="bg-white border border-amber-200 rounded-xl p-4 mb-3 shadow-sm active:bg-gray-50"
          onPress={() => router.push(`/event-detail?eventId=${event.id}`)}
        >
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-lg font-bold flex-1 text-gray-900">{event.title}</Text>
            <View className="bg-amber-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-amber-700">Pending</Text>
            </View>
          </View>

          <View className="space-y-1 mb-3">
            <Text className="text-sm text-gray-600">🏆 {event.sport}</Text>
            <Text className="text-sm text-gray-600">📍 {event.location}</Text>
            <Text className="text-sm text-gray-600">🕐 {formatDate(event.startTime)}</Text>
          </View>

          <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
            <Text className="text-xs text-gray-500">{status}</Text>
            <Text className="text-xs text-gray-400">Requested {formatDate(request.createdAt)}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [formatDate, getEventStatus, router],
  );

  const renderEmptyState = useCallback(
    (message: string) => (
      <View className="items-center justify-center py-16 px-6">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Text className="text-4xl">{activeTab === "created" ? "🏆" : activeTab === "joined" ? "✅" : "⏳"}</Text>
        </View>
        <Text className="text-gray-400 text-center text-base">{message}</Text>
      </View>
    ),
    [activeTab],
  );

  const handleLogout = useCallback(() => {
    logout();
    router.replace("/");
  }, [logout, router]);

  if (!currentUser) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-lg text-gray-500 text-center">Please login to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200">
        <View className="items-center pt-8 pb-6 px-6">
          <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4 shadow-lg">
            <Text size={32} className="text-white">
              {currentUser.username.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-2">{currentUser.username}</Text>

          <Text className="text-sm text-gray-500">
            Member since{" "}
            {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        <View className="flex-row border-t border-gray-100">
          <View className="flex-1 items-center py-4 border-r border-gray-100">
            <Text className="text-2xl font-bold text-blue-600">{userEvents.createdEvents.length}</Text>
            <Text className="text-xs text-gray-600 mt-1">Created</Text>
          </View>
          <View className="flex-1 items-center py-4 border-r border-gray-100">
            <Text className="text-2xl font-bold text-green-600">{userEvents.joinedEvents.length}</Text>
            <Text className="text-xs text-gray-600 mt-1">Joined</Text>
          </View>
          <View className="flex-1 items-center py-4">
            <Text className="text-2xl font-bold text-amber-600">{userEvents.pendingRequests.length}</Text>
            <Text className="text-xs text-gray-600 mt-1">Pending</Text>
          </View>
        </View>
      </View>

      <View className="flex-row bg-white border-b border-gray-200 mt-2">
        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === "created" ? "border-blue-500" : "border-transparent"
          }`}
          onPress={() => setActiveTab("created")}
        >
          <Text className={`font-semibold ${activeTab === "created" ? "text-blue-600" : "text-gray-500"}`}>
            Created ({userEvents.createdEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === "joined" ? "border-green-500" : "border-transparent"
          }`}
          onPress={() => setActiveTab("joined")}
        >
          <Text className={`font-semibold ${activeTab === "joined" ? "text-green-600" : "text-gray-500"}`}>
            Joined ({userEvents.joinedEvents.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-4 items-center border-b-2 ${
            activeTab === "pending" ? "border-amber-500" : "border-transparent"
          }`}
          onPress={() => setActiveTab("pending")}
        >
          <Text className={`font-semibold ${activeTab === "pending" ? "text-amber-600" : "text-gray-500"}`}>
            Pending ({userEvents.pendingRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View className="p-4">
        {activeTab === "created" && (
          <FlatList
            data={createdEvents}
            keyExtractor={item => item.id}
            renderItem={renderEventCard}
            scrollEnabled={false}
            ListEmptyComponent={renderEmptyState(
              "You haven't created any events yet.\nCreate your first event to get started!",
            )}
          />
        )}

        {activeTab === "joined" && (
          <FlatList
            data={joinedEvents}
            keyExtractor={item => item.id}
            renderItem={renderEventCard}
            scrollEnabled={false}
            ListEmptyComponent={renderEmptyState("You haven't joined any events yet.\nBrowse events and join one!")}
          />
        )}

        {activeTab === "pending" && (
          <FlatList
            data={pendingRequestsWithEvents}
            keyExtractor={item => item.request.id}
            renderItem={renderPendingRequestCard}
            scrollEnabled={false}
            ListEmptyComponent={renderEmptyState("No pending requests.\nAll your join requests have been processed.")}
          />
        )}
      </View>

      <View className="p-4 pb-8">
        <TouchableOpacity
          className="bg-red-500 py-4 rounded-xl items-center shadow-sm active:bg-red-600"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
