"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KanbanPage() {

    const router = useRouter();

    // ==============================
    // AUTH
    // ==============================

    const [authChecking, setAuthChecking] =
        useState(true);

    const [currentUser, setCurrentUser] =
        useState(null);


    // ==============================
    // LEADS
    // ==============================

    const [leads, setLeads] =
        useState([]);

    const [loading, setLoading] =
        useState(true);


    // ==============================
    // FETCH AUTH + LEADS
    // ==============================

    useEffect(() => {

        const loadPage = async () => {

            try {

                // Check authentication

                const authResponse =
                    await fetch(
                        "http://localhost:5000/api/auth/me",
                        {
                            credentials: "include"
                        }
                    );

                if (!authResponse.ok) {

                    router.replace("/login");

                    return;
                }


                const authData =
                    await authResponse.json();


                if (!authData.success) {

                    router.replace("/login");

                    return;
                }


                setCurrentUser(
                    authData.user
                );


                // Fetch leads

                const leadsResponse =
                    await fetch(
                        "http://localhost:5000/api/leads",
                        {
                            credentials: "include"
                        }
                    );


                if (leadsResponse.status === 401) {

                    router.replace("/login");

                    return;
                }


                const leadsData =
                    await leadsResponse.json();


                if (leadsData.success) {

                    setLeads(
                        leadsData.leads
                    );
                }


            } catch (error) {

                console.error(
                    "Kanban loading error:",
                    error
                );

                router.replace("/login");

            } finally {

                setLoading(false);
                setAuthChecking(false);

            }
        };


        loadPage();

    }, [router]);


    // ==============================
    // LOGOUT
    // ==============================

    const handleLogout = async () => {

        try {

            await fetch(
                "http://localhost:5000/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            router.replace("/login");

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            router.replace("/login");
        }
    };


    // ==============================
    // UPDATE STATUS
    // ==============================

    const updateLeadStatus = async (
        leadId,
        status
    ) => {

        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/leads/${leadId}/status`,
                    {
                        method: "PATCH",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials: "include",

                        body: JSON.stringify({
                            status
                        })
                    }
                );


            if (response.status === 401) {

                router.replace("/login");

                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                alert(
                    data.message ||
                    "Failed to update status"
                );

                return;
            }


            // Update frontend immediately

            setLeads((previousLeads) =>

                previousLeads.map(
                    (lead) =>

                        lead.id === leadId
                            ? {
                                ...lead,
                                status
                            }
                            : lead
                )

            );


        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            alert(
                "Unable to update lead status"
            );
        }
    };


    // ==============================
    // DRAG START
    // ==============================

    const handleDragStart = (
        event,
        leadId
    ) => {

        event.dataTransfer.setData(
            "leadId",
            String(leadId)
        );

        event.dataTransfer.effectAllowed =
            "move";
    };


    // ==============================
    // DRAG OVER
    // ==============================

    const handleDragOver = (event) => {

        event.preventDefault();

        event.dataTransfer.dropEffect =
            "move";
    };


    // ==============================
    // DROP
    // ==============================

    const handleDrop = async (
        event,
        newStatus
    ) => {

        event.preventDefault();


        const leadId =
            Number(
                event.dataTransfer.getData(
                    "leadId"
                )
            );


        if (!leadId) {
            return;
        }


        const lead =
            leads.find(
                (item) =>
                    item.id === leadId
            );


        if (!lead) {
            return;
        }


        const currentStatus =
            lead.status || "New";


        if (
            currentStatus ===
            newStatus
        ) {
            return;
        }


        await updateLeadStatus(
            leadId,
            newStatus
        );
    };


    // ==============================
    // COLUMNS
    // ==============================

    const columns = [

        {
            title: "🆕 New",
            status: "New",
            header: "bg-blue-50 border-blue-200"
        },

        {
            title: "📞 Contacted",
            status: "Contacted",
            header: "bg-yellow-50 border-yellow-200"
        },

        {
            title: "⚙️ Processing",
            status: "Processing",
            header: "bg-purple-50 border-purple-200"
        },

        {
            title: "✅ Converted",
            status: "Converted",
            header: "bg-green-50 border-green-200"
        },

        {
            title: "❌ Lost",
            status: "Lost",
            header: "bg-red-50 border-red-200"
        }

    ];


    // ==============================
    // AUTH LOADING
    // ==============================

    if (authChecking) {

        return (

            <main className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

                    <div className="text-5xl mb-4">
                        📋
                    </div>

                    <h2 className="text-xl font-bold">
                        Loading Lead Pipeline...
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Please wait
                    </p>

                </div>

            </main>
        );
    }


    // ==============================
    // MAIN PAGE
    // ==============================

    return (

        <main className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-[1600px] mx-auto">


                {/* ==============================
                    HEADER
                ============================== */}

                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">


                    <div>

                        <div className="flex items-center gap-3">

                            <button
                                onClick={() =>
                                    router.push(
                                        "/dashboard"
                                    )
                                }
                                className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50"
                            >
                                ← Dashboard
                            </button>


                            <h1 className="text-3xl font-bold">
                                📋 Lead Pipeline
                            </h1>

                        </div>


                        <p className="text-gray-500 mt-2">

                            Manage your leads through
                            the sales process.

                        </p>


                        {currentUser && (

                            <p className="text-sm text-gray-600 mt-2">

                                Welcome,{" "}

                                <strong>
                                    {currentUser.name}
                                </strong>

                            </p>

                        )}

                    </div>


                    <div className="flex gap-3">

                        <button
                            onClick={() =>
                                router.push(
                                    "/dashboard"
                                )
                            }
                            className="bg-white border border-gray-200 px-5 py-2 rounded-lg font-semibold hover:bg-gray-50"
                        >
                            📊 Dashboard
                        </button>


                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700"
                        >
                            🚪 Logout
                        </button>

                    </div>

                </div>


                {/* ==============================
                    PIPELINE SUMMARY
                ============================== */}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

                    {columns.map(
                        (column) => {

                            const count =
                                leads.filter(
                                    (lead) =>
                                        (
                                            lead.status ||
                                            "New"
                                        ) ===
                                        column.status
                                ).length;


                            return (

                                <div
                                    key={
                                        column.status
                                    }
                                    className={`bg-white rounded-xl shadow p-5 border-l-4 ${
                                        column.status ===
                                        "New"
                                            ? "border-blue-500"
                                            : column.status ===
                                              "Contacted"
                                            ? "border-yellow-500"
                                            : column.status ===
                                              "Processing"
                                            ? "border-purple-500"
                                            : column.status ===
                                              "Converted"
                                            ? "border-green-500"
                                            : "border-red-500"
                                    }`}
                                >

                                    <p className="text-gray-500 text-sm">
                                        {column.title}
                                    </p>

                                    <p className="text-3xl font-bold mt-2">
                                        {count}
                                    </p>

                                </div>

                            );

                        }
                    )}

                </div>


                {/* ==============================
                    KANBAN
                ============================== */}

                {loading ? (

                    <div className="bg-white rounded-2xl shadow p-12 text-center">

                        <div className="text-5xl mb-4">
                            ⏳
                        </div>

                        <p className="text-gray-500">
                            Loading leads...
                        </p>

                    </div>

                ) : (

                    <div className="bg-white rounded-2xl shadow p-5">

                        <div className="flex justify-between items-center mb-5">

                            <div>

                                <h2 className="text-xl font-bold">
                                    Sales Pipeline
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Drag a lead from one stage to another.
                                </p>

                            </div>

                            <span className="bg-gray-100 px-4 py-2 rounded-lg font-semibold text-sm">
                                {leads.length} Total Leads
                            </span>

                        </div>


                        <div className="overflow-x-auto">

                            <div className="flex gap-5 min-w-[1400px]">


                                {columns.map(
                                    (column) => {

                                        const columnLeads =
                                            leads.filter(
                                                (lead) =>
                                                    (
                                                        lead.status ||
                                                        "New"
                                                    ) ===
                                                    column.status
                                            );


                                        return (

                                            <div
                                                key={
                                                    column.status
                                                }
                                                className="w-64 flex-shrink-0"
                                            >


                                                {/* COLUMN */}

                                                <div
                                                    onDragOver={
                                                        handleDragOver
                                                    }
                                                    onDrop={(
                                                        event
                                                    ) =>
                                                        handleDrop(
                                                            event,
                                                            column.status
                                                        )
                                                    }
                                                    className="h-full"
                                                >


                                                    {/* COLUMN HEADER */}

                                                    <div
                                                        className={`border rounded-t-xl p-4 ${column.header}`}
                                                    >

                                                        <div className="flex justify-between items-center">

                                                            <h3 className="font-bold text-gray-800">
                                                                {
                                                                    column.title
                                                                }
                                                            </h3>

                                                            <span className="bg-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                                                {
                                                                    columnLeads.length
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>


                                                    {/* DROP AREA */}

                                                    <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-xl p-3 min-h-[500px] space-y-3">


                                                        {columnLeads.length ===
                                                            0 && (

                                                            <div className="flex flex-col items-center justify-center text-gray-400 text-sm min-h-[250px]">

                                                                <div className="text-4xl mb-3">
                                                                    📥
                                                                </div>

                                                                <p>
                                                                    Drop leads here
                                                                </p>

                                                            </div>

                                                        )}


                                                        {columnLeads.map(
                                                            (
                                                                lead
                                                            ) => (

                                                                <div
                                                                    key={
                                                                        lead.id
                                                                    }
                                                                    draggable
                                                                    onDragStart={(
                                                                        event
                                                                    ) =>
                                                                        handleDragStart(
                                                                            event,
                                                                            lead.id
                                                                        )
                                                                    }
                                                                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition"
                                                                >


                                                                    {/* COMPANY */}

                                                                    <h4 className="font-bold text-gray-900">
                                                                        {
                                                                            lead.company_name
                                                                        }
                                                                    </h4>


                                                                    {/* CATEGORY */}

                                                                    <p className="text-xs text-gray-500 mt-2">
                                                                        🏢{" "}
                                                                        {
                                                                            lead.category ||
                                                                            "Business"
                                                                        }
                                                                    </p>


                                                                    {/* LOCATION */}

                                                                    <p className="text-sm text-gray-500 mt-1">
                                                                        📍{" "}
                                                                        {
                                                                            lead.location ||
                                                                            "Location unavailable"
                                                                        }
                                                                    </p>


                                                                    {/* EMAIL */}

                                                                    <p className="text-sm text-gray-500 mt-1 break-all">
                                                                        📧{" "}
                                                                        {
                                                                            lead.email ||
                                                                            "No email"
                                                                        }
                                                                    </p>


                                                                    {/* PHONE */}

                                                                    {lead.phone && (

                                                                        <p className="text-sm text-gray-500 mt-1">
                                                                            📞{" "}
                                                                            {
                                                                                lead.phone
                                                                            }
                                                                        </p>

                                                                    )}


                                                                    {/* SCORE */}

                                                                    <div className="mt-4 flex justify-between items-center">

                                                                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                                            ⭐{" "}
                                                                            {
                                                                                lead.lead_score ||
                                                                                0
                                                                            }
                                                                            /100
                                                                        </span>


                                                                        <span className="text-xs text-gray-400">
                                                                            #
                                                                            {
                                                                                lead.id
                                                                            }
                                                                        </span>

                                                                    </div>


                                                                    {/* DRAG HINT */}

                                                                    <div className="mt-3 text-xs text-gray-400 text-center border-t pt-2">
                                                                        ↕ Drag to move
                                                                    </div>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                </div>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </main>
    );
}