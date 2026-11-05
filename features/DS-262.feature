# Generated from Jira DS-262: Double-clicking delete icon opens two confirmation dialogs
# UI verified on 2026-11-05 against test.didaxis.studio (Playwright CLI + storageState).
# Review before automating.
#
# Locator hints:
# - Row action: button "Delete {program name}" (visible after hovering the program row; card overflow:hidden)
# - Native confirm: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.
# - Observed: programRow.delete.dblclick() opens TWO sequential window.confirm dialogs (dialogCount = 2).
# - Known defect (this ticket): expected a single confirmation dialog per DS-4 AC.

Feature: DS-262 Single confirmation when double-clicking delete

  # Happy paths

  Scenario: Double-clicking delete opens a single confirmation dialog
    Given I am signed in as an admin on the Programs page
    And a program named "Double Click Delete Probe" exists in the list
    When I hover the program row for "Double Click Delete Probe"
    And I double-click the "Delete Double Click Delete Probe" button
    Then exactly one native confirmation dialog appears
    And the dialog message identifies "Double Click Delete Probe"

  # Negative

  Scenario: Dismissing the single confirmation keeps the program
    Given I am signed in as an admin on the Programs page
    And a program named "Double Click Delete Probe" exists in the list
    When I hover the program row for "Double Click Delete Probe"
    And I double-click the "Delete Double Click Delete Probe" button
    And I dismiss the confirmation dialog
    Then the Programs list still shows "Double Click Delete Probe"

  # Edge cases

  Scenario: Accepting the single confirmation deletes the program once
    Given I am signed in as an admin on the Programs page
    And a program named "Double Click Delete Probe" exists in the list
    When I hover the program row for "Double Click Delete Probe"
    And I double-click the "Delete Double Click Delete Probe" button
    And I accept the confirmation dialog
    Then the Programs list does not show "Double Click Delete Probe"

# ---
# Ambiguities / gaps (resolve before automation):
# - DS-262 does not specify whether a second dialog is suppressed by disabling the button after the first click, or by ignoring duplicate confirm() calls. Assert dialogCount === 1.
# - Live app currently shows dialogCount = 2 on dblclick — mark the single-dialog assertion as known failure (test.fail) until DS-262 is fixed.
# - Confirm uses native window.confirm, not a Mantine dialog.
