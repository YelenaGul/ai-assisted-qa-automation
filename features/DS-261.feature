# Generated from Jira DS-261: JuliaY: No error message shown when program delete API fails
# UI verified on 2026-11-05 against https://test.didaxis.studio (Playwright CLI explore)
# Locator hints: Delete button role=button name="Delete {programName}"; native window.confirm
# Confirm copy: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.
# Review before automating.

Feature: DS-261 Error message when program delete API fails

  # Happy paths / expected AC (DS-4 TC-005)

  Scenario: Failed delete keeps the program and shows an error
    Given an admin is on the Programs page with program "DS261 Fail Delete" in the list
    And the next DELETE /api/programs/:id response will be HTTP 500
    When the admin clicks the Delete button for "DS261 Fail Delete" and confirms the native dialog
    Then "DS261 Fail Delete" remains visible in the program list
    And the user sees a clear error message indicating the program could not be deleted

  # Negative

  Scenario: Silent failure is not acceptable after a 500 delete
    Given an admin confirmed delete for a program whose DELETE returned HTTP 500
    When the Programs page settles after the failed request
    Then no success state is shown for that deletion
    And an alert, toast, or inline error is visible (observed 2026-11-05: alerts=0, toastLike=0 — app bug)

  # Edge cases

  Scenario: List stays consistent after failed server-side deletion
    Given an admin is on the Programs page with program "DS261 Fail Delete" in the list
    And DELETE /api/programs/:id is mocked to return 500
    When the admin confirms deletion
    Then the program row count for "DS261 Fail Delete" remains 1

# ---
# Ambiguities / gaps (resolve before automation):
# - Exact user-facing error copy is undefined; live app shows no alert/toast/inline error on DELETE 500.
# - Until DS-261 is fixed, automation should assert program remains listed and document missing error UI
#   (do not invent toast strings). Prefer test.fail / known-bug annotation for the message assertion.
# UI verification summary: Playwright CLI with storageState; DELETE mocked to 500; confirm accepted;
# program remained; getByRole('alert') count 0; no toast-like nodes; no dedicated error copy.
