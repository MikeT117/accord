import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useDeleteSessionMutation } from "@/lib/react-query/mutations/delete-session-mutation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/lib/react-query/queries/session-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatDistanceToNow } from "date-fns";
import { Trash2Icon } from "lucide-react";
import { DestructiveIconButton } from "../destructive-icon-button";

export function UserSettingsSessionsSection() {
    const { data } = useInfiniteQuery(sessionQueryOptions({}));
    const { mutate: deleteSession } = useDeleteSessionMutation();

    return (
        <SettingsDialogContentSection title="Account Sessions" description="Manage account sessions.">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User Agent</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data?.pages.flat().map((session) => (
                        <TableRow key={session.id}>
                            <TableCell>
                                <div className="text-wrap wrap-anywhere">{session.userAgent}</div>
                            </TableCell>
                            <TableCell>{session.ipAddress.split(":")[0]}</TableCell>
                            <TableCell>
                                {formatDistanceToNow(session.createdAt, {
                                    addSuffix: true,
                                })}
                            </TableCell>
                            <TableCell>
                                <DestructiveIconButton
                                    onClick={() => deleteSession({ id: session.id })}
                                    tooltipText="Delete Session"
                                >
                                    <Trash2Icon />
                                </DestructiveIconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </SettingsDialogContentSection>
    );
}
