import { SettingsDialogContentSection } from "../settings-dialog/settings-dialog-content-section";
import { useDeleteSessionMutation } from "@/lib/react-query/mutations/delete-session-mutation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "@/lib/react-query/queries/session-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatDistanceToNow } from "date-fns";
import { Trash2Icon } from "lucide-react";
import { ButtonWithTooltip } from "../button-with-tooltip";
import { Card, CardContent } from "../ui/card";

export function UserSettingsSessionsSection() {
    const { data } = useInfiniteQuery(sessionQueryOptions({}));
    const { mutate: deleteSession } = useDeleteSessionMutation();

    return (
        <SettingsDialogContentSection title="Account Sessions" description="Manage account sessions.">
            <Card className="bg-transparent p-0">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User Agent</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.pages.flat().map((session) => (
                                <TableRow key={session.id}>
                                    <TableCell>
                                        <span className="text-xs text-wrap wrap-anywhere">{session.userAgent}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs">{session.ipAddress.split(":")[0]}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs">
                                            {formatDistanceToNow(session.createdAt, {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <ButtonWithTooltip
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => deleteSession({ id: session.id })}
                                            tooltipText="Delete Session"
                                        >
                                            <Trash2Icon />
                                        </ButtonWithTooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </SettingsDialogContentSection>
    );
}
