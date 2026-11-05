# Generated from Jira DS-261: No error message shown when program delete API fails
# UI verified on 2026-11-05 against test.didaxis.studio (Playwright CLI + storageState).
# Review before automating.
#
# Locator hints:
# - Page heading: Programs
# - Row action: button "Delete {program name}"
# - Native confirm: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.
# - Observed on DELETE HTTP 500 (page.route mock): program remains listed; no role=alert, role=status, toast, or inline error text appears.
# - Known defect (this ticket): expected clear error message is missing — assert expected AC; mark known failure until fixed.

Feature: DS-261 Error feedback when program delete API fails

  # Happy paths

  Scenario: Failed delete keeps the program and shows an error
    Given I am signed in as an admin on the Programs page
    And a program named "Delete Fail Probe" exists in the list
    And the next DELETE /api/programs/:id response is mocked as HTTP 500
    When I click "Delete Delete Fail Probe"
    And I accept the native confirmation dialog
    Then the Programs list still shows "Delete Fail Probe"
    And I see a clear user-visible error indicating the program could not be deleted

  # Negative

  Scenario: Successful delete still removes the program when the API succeeds
    Given I am signed in as an admin on the Programs page
    And a program named "Delete Success Probe" exists in the list
    And DELETE /api/programs/:id is not mocked
    When I click "Delete Delete Success Probe"
    And I accept the native confirmation dialog
    Then the Programs list does not show "Delete Success Probe"

  # Edge cases

  Scenario: Failed delete does not leave the UI in a broken state
    Given I am signed in as an admin on the Programs page
    And a program named "Delete Fail Probe" exists in the list
    And the next DELETE /api/programs/:id response is mocked as HTTP 500
    When I click "Delete Delete Fail Probe"
    And I accept the native confirmation dialog
    Then the Programs heading remains visible
    And the "+ New Program" button remains visible
    And the Programs list still shows "Delete Fail Probe"

# ---
# Ambiguities / gaps (resolve before automation):
# - Exact error copy is not specified in DS-261 / DS-4 AC ("clear error message"). Live app shows none today — do not invent toast text; assert a user-visible alert/status/error region once product copy exists, or assert presence of any role=alert / role=status with delete-failure wording when fixed.
# - Until DS-261 is fixed, the "shows an error" assertion documents the known defect (use test.fail or equivalent so CI stays honest).
# - Confirm dialog uses native window.confirm (not a Mantine dialog).
