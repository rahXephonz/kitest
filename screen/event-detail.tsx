import { useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { FlatList, View, TouchableOpacity } from "react-native";

import { Text } from "@/components/ui";
import { eventsAtom, requestsAtom, usersAtom, canJoinEventAtom } from "@/state/atoms";
import { useAcceptRequest, useAuth, useJoinEvent, useRejectRequest } from "@/hooks/useModule";

export const EventDetailsScreen = () => {
  const { currentUser } = useAuth();
  const { eventId } = useLocalSearchParams() as Record<string, string>;

  // Get atoms directly to avoid re-render issues
  const events = useAtomValue(eventsAtom);
  const requests = useAtomValue(requestsAtom);
  const users = useAtomValue(usersAtom);
  const checkCanJoin = useAtomValue(canJoinEventAtom);

  const joinEvent = useJoinEvent();
  const acceptRequest = useAcceptRequest();
  const rejectRequest = useRejectRequest();

  const event = useMemo(() => events.get(eventId), [events, eventId]);

  const eventRequests = useMemo(
    () => Array.from(requests.values()).filter(req => req.eventId === eventId),
    [requests, eventId],
  );

  const participants = useMemo(() => {
    const acceptedUserIds = eventRequests.filter(req => req.status === "ACCEPTED").map(req => req.userId);

    return acceptedUserIds.map(id => users.get(id)).filter(user => user !== undefined);
  }, [eventRequests, users]);

  const pendingRequests = useMemo(() => {
    return eventRequests
      .filter(req => req.status === "PENDING")
      .map(req => {
        const user = users.get(req.userId);
        return user ? { ...req, user } : null;
      })
      .filter(item => item !== null);
  }, [eventRequests, users]);

  const organizer = useMemo(() => (event ? users.get(event.organizerId) : null), [event, users]);
  const canJoin = useMemo(() => checkCanJoin(eventId, currentUser?.id || ""), [checkCanJoin, eventId, currentUser?.id]);
  const isOrganizer = useMemo(() => event?.organizerId === currentUser?.id, [event?.organizerId, currentUser?.id]);

  const handleJoinEvent = useCallback(async () => {
    const result = await joinEvent(eventId);
    if (!result.success) {
      alert(result.error);
    }
  }, [joinEvent, eventId]);

  const handleAccept = useCallback(
    async (requestId: string) => {
      const result = await acceptRequest(requestId);
      if (!result.success) {
        alert(result.error);
      }
    },
    [acceptRequest],
  );

  const handleReject = useCallback(
    async (requestId: string) => {
      const result = await rejectRequest(requestId);
      if (!result.success) {
        alert(result.error);
      }
    },
    [rejectRequest],
  );

  const formatDate = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleString("en-US", {
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
    });
  }, []);

  const getEventStatus = useCallback((event: any): string => {
    const now = Date.now();
    if (event.startTime > now) return "Upcoming";
    if (event.endTime > now) return "In Progress";
    return "Completed";
  }, []);

  if (!event) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Event not found</Text>
      </View>
    );
  }

  const status = getEventStatus(event);

  return (
    <>
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-start mb-3">
          <Text className="text-2xl font-bold flex-1 text-gray-900">{event.title}</Text>
          <View
            className={`px-3 py-1 rounded-full ${
              status === "Upcoming" ? "bg-blue-100" : status === "In Progress" ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                status === "Upcoming" ? "text-blue-700" : status === "In Progress" ? "text-green-700" : "text-gray-700"
              }`}
            >
              {status}
            </Text>
          </View>
        </View>

        <View className="space-y-2">
          <View className="flex-row items-center">
            <Text className="text-base text-gray-600">🏆 {event.sport}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-base text-gray-600">👤 Organizer: {organizer?.username || "Unknown"}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-base text-gray-600">📍 {event.location}</Text>
          </View>
        </View>
      </View>

      <View className="bg-white p-4 mt-2 border-b border-gray-200">
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Start Time</Text>
            <Text className="text-sm font-semibold text-gray-900">{formatDate(event.startTime)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">End Time</Text>
            <Text className="text-sm font-semibold text-gray-900">{formatDate(event.endTime)}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      {event.description && (
        <View className="bg-white p-4 mt-2 border-b border-gray-200">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
          <Text className="text-sm text-gray-600 leading-5">{event.description}</Text>
        </View>
      )}

      <View className="bg-white p-4 mt-2 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm font-semibold text-gray-700">Players</Text>
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-blue-600">{participants.length}</Text>
            <Text className="text-sm text-gray-500 mx-1">/</Text>
            <Text className="text-lg font-bold text-gray-400">{event.maxPlayers}</Text>
          </View>
        </View>
      </View>

      {!isOrganizer && (
        <View className="p-4">
          {canJoin.canJoin ? (
            <TouchableOpacity
              className="bg-blue-500 py-4 rounded-lg items-center active:bg-blue-600"
              onPress={handleJoinEvent}
            >
              <Text className="text-white font-semibold text-base">Request to Join</Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <Text className="text-amber-800 text-center">{canJoin.reason}</Text>
            </View>
          )}
        </View>
      )}

      <View className="bg-white mt-2 border-t border-gray-200">
        <View className="p-4 border-b border-gray-100">
          <Text className="text-base font-semibold text-gray-900">Participants ({participants.length})</Text>
        </View>
        {participants.length === 0 ? (
          <View className="p-8 items-center">
            <Text className="text-gray-400 text-center">No participants yet</Text>
          </View>
        ) : (
          <FlatList
            data={participants}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ index, item }) => (
              <View
                className={`p-4 flex-row items-center ${
                  index !== participants.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <Text className="text-white font-semibold">{item.username.charAt(0).toUpperCase()}</Text>
                </View>
                <Text className="text-base text-gray-900">{item.username}</Text>
              </View>
            )}
          />
        )}
      </View>

      {isOrganizer && pendingRequests.length > 0 && (
        <View className="bg-white mt-2 border-t border-gray-200 mb-4">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-base font-semibold text-gray-900">Pending Requests ({pendingRequests.length})</Text>
          </View>
          <FlatList
            data={pendingRequests}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ index, item }) => (
              <View className={`p-4 ${index !== pendingRequests.length - 1 ? "border-b border-gray-100" : ""}`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-amber-500 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-semibold">{item.user.username.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base text-gray-900 font-medium">{item.user.username}</Text>
                      <Text className="text-xs text-gray-500 mt-1">Requested {formatDate(item.createdAt)}</Text>
                    </View>
                  </View>
                  <View className="flex-row space-x-2 ml-2">
                    <TouchableOpacity
                      className="bg-green-500 px-4 py-2 rounded-lg active:bg-green-600"
                      onPress={() => handleAccept(item.id)}
                    >
                      <Text className="text-white font-semibold text-sm">Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-red-500 px-4 py-2 rounded-lg active:bg-red-600 ml-2"
                      onPress={() => handleReject(item.id)}
                    >
                      <Text className="text-white font-semibold text-sm">Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </>
  );
};
