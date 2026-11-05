# Generated from Jira DS-262: JuliaY: Double-clicking delete icon opens two confirmation dialogs
# UI verified on 2026-11-05 against https://test.didaxis.studio (Playwright CLI explore)
# Locator hints: Delete button role=button name="Delete {programName}"; native window.confirm
# Confirm copy: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.
# Review before automating.

Feature: DS-262 Single confirmation dialog on delete double-click

  # Happy paths / expected AC (DS-4 TC-012)

  Scenario: Double-clicking delete opens a single confirmation dialog
    Given an admin is on the Programs page with program "DS262 Double Click" in the list
    When the admin double-clicks the Delete button for "DS262 Double Click"
    Then exactly one native confirmation dialog appears
    And the dialog message identifies "DS262 Double Click"

  # Negative

  Scenario: A second confirmation dialog must not appear after double-click
    Given an admin double-clicked Delete for "DS262 Double Click"
    When the first confirmation dialog is dismissed
    Then no second confirmation dialog is shown
    And "DS262 Double Click" remains in the program list

  # Edge cases

  Scenario: Confirming the single dialog after an accidental double-click deletes once
    Given an admin double-clicked Delete for "DS262 Double Click" and only one dialog opened
    When the admin accepts that confirmation
    Then "DS262 Double Click" is removed from the program list

# ---
# Ambiguities / gaps (resolve before automation):
# - Live app (2026-11-05): dialogCount = 2 on delete button dblclick — open bug DS-262.
# - Automation should count dialog events on dblclick; mark expected single-dialog assertion with
#   test.fail until product debounces the delete action.
# UI verification summary: Playwright CLI; dblclick Delete; two sequential native confirms observed.
