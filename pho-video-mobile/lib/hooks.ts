import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, GenerateVideoParams, Video } from "./api";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { notifications } from "./notifications";

/**
 * Hook truy vấn danh sách video (Gallery)
 */
export const useVideoFeed = (filter: string = "all") => {
    return useQuery({
        queryKey: ["videos", filter],
        queryFn: () => api.getVideos(),
        // Tự động refetch khi window focus (trở lại app)
        refetchOnWindowFocus: true,
        // Intelligent Polling: Poll nếu có video nào đang process
        // Intelligent Polling: Poll nếu có video nào đang process
        refetchInterval: (query) => {
            const data = query.state.data;
            const hasPending = Array.isArray(data) && data.some((v: any) =>
                v.status === "processing" || v.status === "pending"
            );
            return hasPending ? 3000 : false;
        }
    });
};

/**
 * Hook 'Bộ não' xử lý tạo video và Polling trạng thái
 */
export const useGenerateVideo = () => {
    const queryClient = useQueryClient();
    const [pollingTaskId, setPollingTaskId] = useState<string | null>(null);

    // 1. Mutation gửi yêu cầu tạo video
    const generateMutation = useMutation({
        mutationFn: (params: GenerateVideoParams) => api.generateVideo(params),
        onSuccess: (newVideo) => {
            if (newVideo.taskId) {
                console.log("[DEBUG] Video Task Started:", newVideo.taskId);
                setPollingTaskId(newVideo.taskId);
            }
        },
    });

    // 2. Query để Polling trạng thái dựa trên taskId
    const statusQuery = useQuery({
        queryKey: ["video-status", pollingTaskId],
        queryFn: async () => {
            const data = await api.getVideoStatus(pollingTaskId!);
            console.log("[DEBUG] Polling Data:", data);
            return data;
        },
        enabled: !!pollingTaskId,
        // Polling mỗi 3 giây
        refetchInterval: (query) => {
            const data = query.state.data;
            // Dừng polling khi đã hoàn thành hoặc thất bại
            if (data?.status === "success" || data?.status === "failed") {
                return false;
            }
            return 3000;
        },
        // Khi hoàn thành, chúng ta reset polling và cập nhật gallery
    });

    // Effect để handle success/failure status (React Query v5 separation)
    useEffect(() => {
        if (statusQuery.data?.status === "success" || statusQuery.data?.status === "failed") {
            if (statusQuery.data?.status === "success") {
                notifications.notifyVideoReady(statusQuery.data.id, statusQuery.data.prompt || "");
            }
            if (statusQuery.data?.status === "failed") {
                Alert.alert("Generation Failed", "There was an error generating your video.");
            }

            // Delay một chút để UI kịp update
            const timer = setTimeout(() => {
                setPollingTaskId(null);
                queryClient.invalidateQueries({ queryKey: ["videos"] });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [statusQuery.data?.status, statusQuery.data?.id, statusQuery.data?.prompt, queryClient]);

    // Handle initial mutation error
    useEffect(() => {
        if (generateMutation.isError) {
            Alert.alert("API Error", generateMutation.error?.message || "Could not start generation");
        }
    }, [generateMutation.isError, generateMutation.error]);

    return {
        generate: generateMutation.mutate,
        isGenerating: generateMutation.isPending || !!pollingTaskId,
        status: statusQuery.data?.status || (generateMutation.isPending ? "pending" : "idle"),
        error: generateMutation.error || statusQuery.error,
        video: statusQuery.data,
    };
};

export const useAppConfig = () => {
    return useQuery({
        queryKey: ["app-config"],
        queryFn: () => api.getAppConfig(),
        staleTime: 1000 * 60 * 60, // Cache for 1 hour
    });
};
