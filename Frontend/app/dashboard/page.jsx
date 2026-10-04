"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {

    const router = useRouter();

    // ==============================
    // AUTH
    // ==============================

    const [authChecking, setAuthChecking] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // ==============================
    // LEADS
    // ==============================

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [qualityFilter, setQualityFilter] = useState("All");

    // ==============================
    // AI OUTREACH
    // ==============================

    const [emailModal, setEmailModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [generatedEmail, setGeneratedEmail] = useState(null);
    const [generatingEmail, setGeneratingEmail] = useState(false);


    // ==============================
    // CHECK AUTH
    // ==============================

    useEffect(() => {

        const checkAuth = async () => {

            try {

                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        credentials: "include"
                    }
                );

                if (!response.ok) {
                    router.replace("/login");
                    return;
                }

                const data = await response.json();

                if (!data.success) {
                    router.replace("/login");
                    return;
                }

                setCurrentUser(data.user);

                await fetchLeads();

            } catch (error) {

                console.error(
                    "Authentication error:",
                    error
                );

                router.replace("/login");

            } finally {

                setAuthChecking(false);

            }
        };

        checkAuth();

    }, [router]);


    // ==============================
    // FETCH LEADS
    // ==============================

    const fetchLeads = async () => {

        try {

            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/leads",
                {
                    credentials: "include"
                }
            );

            if (response.status === 401) {
                router.replace("/login");
                return;
            }

            const data = await response.json();

            if (data.success) {
                setLeads(data.leads);
            }

        } catch (error) {

            console.error(
                "Failed to fetch leads:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


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
    // EXPORT CSV
    // ==============================

    const exportCSV = () => {

        if (leads.length === 0) {

            alert(
                "No leads available to export."
            );

            return;
        }

        const headers = [
            "Company Name",
            "Website",
            "Email",
            "Phone",
            "Location",
            "Category",
            "Description",
            "AI Summary",
            "Lead Score",
            "Status"
        ];

        const rows = leads.map((lead) => [

            lead.company_name,
            lead.website || "",
            lead.email || "",
            lead.phone || "",
            lead.location || "",
            lead.category || "",
            lead.description || "",
            lead.ai_summary || "",
            lead.lead_score || 0,
            lead.status || "New"

        ]);

        const csvContent = [
            headers,
            ...rows
        ]
            .map((row) =>
                row
                    .map((value) =>
                        `"${String(value).replace(/"/g, '""')}"`
                    )
                    .join(",")
            )
            .join("\n");

        const blob = new Blob(
            [csvContent],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            "ai-business-leads.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };


    // ==============================
    // AI OUTREACH
    // ==============================

    const generateEmail = async (lead) => {

        setSelectedLead(lead);
        setGeneratedEmail(null);
        setEmailModal(true);
        setGeneratingEmail(true);

        try {

            const response = await fetch(
                "http://localhost:5000/api/email/generate",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify(lead)
                }
            );

            if (response.status === 401) {
                router.replace("/login");
                return;
            }

            const data =
                await response.json();

            if (data.success) {

                setGeneratedEmail(
                    data.email
                );

            } else {

                alert(
                    data.message ||
                    "Failed to generate AI outreach"
                );

                setEmailModal(false);
            }

        } catch (error) {

            console.error(
                "AI outreach error:",
                error
            );

            alert(
                "Failed to connect with AI outreach service"
            );

            setEmailModal(false);

        } finally {

            setGeneratingEmail(false);

        }
    };


    // ==============================
    // COPY EMAIL
    // ==============================

    const copyEmail = async () => {

        if (!generatedEmail) {
            return;
        }

        const fullEmail =
            `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;

        try {

            await navigator.clipboard.writeText(
                fullEmail
            );

            alert(
                "✅ Email copied to clipboard!"
            );

        } catch (error) {

            console.error(
                "Copy error:",
                error
            );

            alert(
                "Unable to copy email"
            );
        }
    };


    // ==============================
    // STATISTICS
    // ==============================

    const highQuality =
        leads.filter(
            (lead) =>
                Number(
                    lead.lead_score || 0
                ) >= 80
        ).length;

    const mediumQuality =
        leads.filter(
            (lead) => {

                const score =
                    Number(
                        lead.lead_score || 0
                    );

                return (
                    score >= 50 &&
                    score < 80
                );
            }
        ).length;

    const averageScore =
        leads.length > 0
            ? Math.round(
                leads.reduce(
                    (sum, lead) =>
                        sum +
                        Number(
                            lead.lead_score || 0
                        ),
                    0
                ) / leads.length
            )
            : 0;


    // ==============================
    // SEARCH + FILTER
    // ==============================

    const filteredLeads =
        leads.filter((lead) => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                (lead.company_name || "")
                    .toLowerCase()
                    .includes(search) ||

                (lead.category || "")
                    .toLowerCase()
                    .includes(search) ||

                (lead.location || "")
                    .toLowerCase()
                    .includes(search) ||

                (lead.email || "")
                    .toLowerCase()
                    .includes(search);

            const score =
                Number(
                    lead.lead_score || 0
                );

            let matchesQuality = true;

            if (qualityFilter === "High") {
                matchesQuality =
                    score >= 80;
            }

            if (qualityFilter === "Medium") {
                matchesQuality =
                    score >= 50 &&
                    score < 80;
            }

            if (qualityFilter === "Low") {
                matchesQuality =
                    score < 50;
            }

            return (
                matchesSearch &&
                matchesQuality
            );

        });


    // ==============================
    // SCORE STYLE
    // ==============================

    const getScoreStyle = (score) => {

        if (score >= 80) {
            return "bg-green-100 text-green-700";
        }

        if (score >= 50) {
            return "bg-yellow-100 text-yellow-700";
        }

        return "bg-red-100 text-red-700";
    };


    // ==============================
    // AUTH LOADING
    // ==============================

    if (authChecking) {

        return (

            <main className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">

                    <div className="text-4xl mb-4">
                        🔐
                    </div>

                    <h2 className="text-xl font-bold">
                        Checking authentication...
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Please wait
                    </p>

                </div>

            </main>
        );
    }


    // ==============================
    // DASHBOARD
    // ==============================

    return (

        <main className="min-h-screen bg-gray-100 p-6">

            <div className="max-w-7xl mx-auto">


                {/* ================= HEADER ================= */}

                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">

                    <div>

                        <h1 className="text-3xl font-bold">
                            📊 Lead Dashboard
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Find, analyze and contact potential business leads
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


                    <div className="flex gap-3 flex-wrap">

                        {/* EXPORT */}

                        <button
                            onClick={exportCSV}
                            className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700"
                        >
                            📥 Export CSV
                        </button>


                        {/* KANBAN */}

                        <a
                            href="/kanban"
                            className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-purple-700"
                        >
                            📋 Lead Pipeline
                        </a>


                        {/* FIND MORE */}

                        <a
                            href="/"
                            className="bg-black text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-800"
                        >
                            🔍 Find More Leads
                        </a>


                        {/* LOGOUT */}

                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700"
                        >
                            🚪 Logout
                        </button>

                    </div>

                </div>


                {/* ================= STAT CARDS ================= */}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Leads
                        </p>

                        <h2 className="text-3xl font-bold mt-2">
                            {leads.length}
                        </h2>

                    </div>


                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            🟢 High Quality
                        </p>

                        <h2 className="text-3xl font-bold text-green-600 mt-2">
                            {highQuality}
                        </h2>

                    </div>


                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            🟡 Medium Quality
                        </p>

                        <h2 className="text-3xl font-bold text-yellow-600 mt-2">
                            {mediumQuality}
                        </h2>

                    </div>


                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Average Lead Score
                        </p>

                        <h2 className="text-3xl font-bold text-blue-600 mt-2">

                            {averageScore}

                            <span className="text-lg text-gray-400">
                                /100
                            </span>

                        </h2>

                    </div>

                </div>


                {/* ================= SEARCH + FILTER ================= */}

                <div className="bg-white rounded-xl shadow p-5 mb-6">

                    <div className="flex flex-col md:flex-row gap-4">

                        <input
                            type="text"
                            placeholder="🔎 Search company, category, location or email..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            className="flex-1 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />


                        <select
                            value={qualityFilter}
                            onChange={(e) =>
                                setQualityFilter(
                                    e.target.value
                                )
                            }
                            className="border rounded-lg p-3 bg-white"
                        >

                            <option value="All">
                                All Leads
                            </option>

                            <option value="High">
                                🟢 High Quality
                            </option>

                            <option value="Medium">
                                🟡 Medium Quality
                            </option>

                            <option value="Low">
                                🔴 Low Quality
                            </option>

                        </select>

                    </div>


                    <p className="text-sm text-gray-500 mt-3">

                        Showing{" "}

                        <strong>
                            {filteredLeads.length}
                        </strong>{" "}

                        of{" "}

                        <strong>
                            {leads.length}
                        </strong>{" "}

                        leads

                    </p>

                </div>


                {/* ================= SAVED LEADS ================= */}

                <div className="bg-white rounded-xl shadow overflow-hidden">

                    <div className="p-6 border-b">

                        <h2 className="text-xl font-bold">
                            💼 Saved Leads
                        </h2>

                    </div>


                    {loading ? (

                        <div className="p-8 text-center text-gray-500">
                            Loading leads...
                        </div>

                    ) : leads.length === 0 ? (

                        <div className="p-8 text-center text-gray-500">

                            <div className="text-4xl mb-3">
                                📭
                            </div>

                            <p>
                                No saved leads yet.
                            </p>

                            <a
                                href="/"
                                className="inline-block mt-4 bg-black text-white px-5 py-2 rounded-lg"
                            >
                                Find Your First Lead
                            </a>

                        </div>

                    ) : filteredLeads.length === 0 ? (

                        <div className="p-8 text-center text-gray-500">

                            <div className="text-4xl mb-3">
                                🔎
                            </div>

                            <p className="font-semibold">
                                No matching leads found.
                            </p>

                            <p className="text-sm mt-1">
                                Try another search or filter.
                            </p>

                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setQualityFilter("All");
                                }}
                                className="mt-4 bg-black text-white px-5 py-2 rounded-lg"
                            >
                                Clear Filters
                            </button>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left p-4">
                                            Company
                                        </th>

                                        <th className="text-left p-4">
                                            Category
                                        </th>

                                        <th className="text-left p-4">
                                            Location
                                        </th>

                                        <th className="text-left p-4">
                                            Contact
                                        </th>

                                        <th className="text-left p-4">
                                            Score
                                        </th>

                                        <th className="text-left p-4">
                                            Status
                                        </th>

                                        <th className="text-left p-4">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredLeads.map((lead) => {

                                        const score =
                                            Number(
                                                lead.lead_score || 0
                                            );

                                        const hasWebsite =
                                            Boolean(
                                                lead.website &&
                                                lead.website.trim()
                                            );

                                        return (

                                            <tr
                                                key={lead.id}
                                                className="border-t hover:bg-gray-50"
                                            >

                                                <td className="p-4">
                                                    <div className="font-semibold">
                                                        {lead.company_name}
                                                    </div>
                                                </td>


                                                <td className="p-4">
                                                    {lead.category || "—"}
                                                </td>


                                                <td className="p-4">
                                                    {lead.location || "—"}
                                                </td>


                                                <td className="p-4 text-sm">

                                                    <div>
                                                        📧{" "}
                                                        {lead.email || "—"}
                                                    </div>

                                                    <div className="mt-1">
                                                        📞{" "}
                                                        {lead.phone || "—"}
                                                    </div>

                                                </td>


                                                <td className="p-4">

                                                    <span
                                                        className={`px-3 py-1 rounded-full font-semibold ${getScoreStyle(score)}`}
                                                    >
                                                        {score}/100
                                                    </span>

                                                </td>


                                                <td className="p-4">

                                                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold whitespace-nowrap">

                                                        {lead.status === "Contacted" && "📞 "}
                                                        {lead.status === "Processing" && "⚙️ "}
                                                        {lead.status === "Converted" && "✅ "}
                                                        {lead.status === "Lost" && "❌ "}
                                                        {!lead.status || lead.status === "New"
                                                            ? "🆕 "
                                                            : ""}

                                                        {lead.status || "New"}

                                                    </span>

                                                </td>


                                                <td className="p-4">

                                                    <div className="flex flex-wrap gap-2">

                                                        {lead.phone && (

                                                            <a
                                                                href={`tel:${lead.phone}`}
                                                                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-200"
                                                            >
                                                                📞 Call
                                                            </a>

                                                        )}


                                                        <button
                                                            onClick={() =>
                                                                generateEmail(
                                                                    lead
                                                                )
                                                            }
                                                            className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200"
                                                        >
                                                            🚀 AI Outreach
                                                        </button>


                                                        {hasWebsite && (

                                                            <a
                                                                href={
                                                                    lead.website.startsWith("http")
                                                                        ? lead.website
                                                                        : `https://${lead.website}`
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
                                                            >
                                                                🌐 Website
                                                            </a>

                                                        )}


                                                        {!hasWebsite && (

                                                            <span className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold">
                                                                🌐 No Website
                                                            </span>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* =====================================================
                AI OUTREACH MODAL
            ===================================================== */}

            {emailModal && (

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center mb-6">

                            <div>

                                <h2 className="text-2xl font-bold">
                                    🚀 AI Outreach Composer
                                </h2>

                                {selectedLead && (

                                    <p className="text-gray-500 mt-1">
                                        For:{" "}
                                        {selectedLead.company_name}
                                    </p>

                                )}

                            </div>


                            <button
                                onClick={() =>
                                    setEmailModal(false)
                                }
                                className="text-gray-500 text-2xl hover:text-black"
                            >
                                ✕
                            </button>

                        </div>


                        {generatingEmail && (

                            <div className="text-center py-12">

                                <div className="text-5xl mb-4">
                                    🤖
                                </div>

                                <p className="font-semibold">
                                    AI is analyzing this business...
                                </p>

                                <p className="text-sm text-gray-500 mt-2">
                                    Creating a personalized outreach message
                                </p>

                            </div>

                        )}


                        {!generatingEmail &&
                            generatedEmail && (

                                <div>

                                    {generatedEmail.opportunity && (

                                        <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4">

                                            <p className="text-sm text-gray-500">
                                                AI Detected Opportunity
                                            </p>

                                            <p className="text-lg font-bold text-green-700 mt-1">
                                                🌐{" "}
                                                {generatedEmail.opportunity}
                                            </p>

                                        </div>

                                    )}


                                    <div className="mb-5">

                                        <span
                                            className={
                                                selectedLead?.website
                                                    ? "inline-block bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-semibold"
                                                    : "inline-block bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-semibold"
                                            }
                                        >

                                            {selectedLead?.website
                                                ? "🌐 Website Available"
                                                : "⚠️ Website Not Available"}

                                        </span>

                                    </div>


                                    <div className="mb-4">

                                        <label className="block font-semibold mb-2">
                                            To
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                selectedLead?.email ||
                                                "Email not publicly available"
                                            }
                                            readOnly
                                            className="w-full border rounded-lg p-3 bg-gray-50"
                                        />

                                    </div>


                                    <div className="mb-4">

                                        <label className="block font-semibold mb-2">
                                            Subject
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                generatedEmail.subject || ""
                                            }
                                            readOnly
                                            className="w-full border rounded-lg p-3"
                                        />

                                    </div>


                                    <div className="mb-5">

                                        <label className="block font-semibold mb-2">
                                            Email Body
                                        </label>

                                        <textarea
                                            value={
                                                generatedEmail.body || ""
                                            }
                                            readOnly
                                            rows={11}
                                            className="w-full border rounded-lg p-3 resize-none leading-6"
                                        />

                                    </div>


                                    <div className="flex flex-wrap gap-3">

                                        <button
                                            onClick={copyEmail}
                                            className="bg-black text-white px-5 py-2 rounded-lg font-semibold hover:bg-gray-800"
                                        >
                                            📋 Copy Email
                                        </button>


                                        {selectedLead?.email && (

                                            <a
                                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                                                    selectedLead.email
                                                )}&su=${encodeURIComponent(
                                                    generatedEmail.subject || ""
                                                )}&body=${encodeURIComponent(
                                                    generatedEmail.body || ""
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700"
                                            >
                                                ✉️ Open Gmail
                                            </a>

                                        )}


                                        <button
                                            onClick={() =>
                                                generateEmail(
                                                    selectedLead
                                                )
                                            }
                                            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300"
                                        >
                                            🔄 Regenerate
                                        </button>

                                    </div>


                                    {!selectedLead?.email && (

                                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">

                                            ⚠️ No public email was found for
                                            this business.

                                        </div>

                                    )}

                                </div>

                            )}

                    </div>

                </div>

            )}

        </main>
    );
}