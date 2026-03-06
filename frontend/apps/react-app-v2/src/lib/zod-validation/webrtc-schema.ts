import * as z from "zod/v4-mini";

export const rtcCandidateSchema = z.object({
    candidate: z.optional(z.string()),
    sdpMLineIndex: z.optional(z.nullable(z.number())),
    sdpMid: z.optional(z.nullable(z.string())),
    usernameFragment: z.optional(z.nullable(z.string())),
});

const sdpType = z.enum(["answer", "offer"]);

export const rtcSessionDescriptionSchema = z.object({
    sdp: z.optional(z.string()),
    type: sdpType,
});

export type RTCCandidateType = z.infer<typeof rtcCandidateSchema>;
export type RTCSessionDescriptionType = z.infer<typeof rtcSessionDescriptionSchema>;
