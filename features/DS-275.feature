# Generated from Jira DS-275: Liubov - Delete program with confirmation
# UI verified on 2026-11-05 against https://test.didaxis.studio (Playwright CLI explore)
# Locator hints: Delete button role=button name="Delete {programName}"; native window.confirm (not Mantine dialog)
# Confirm copy: Delete program "{name}"? All its semesters and courses will be removed. This cannot be undone.
# Review before automating.

Feature: DS-275 Delete program with confirmation

  # Happy paths

  Scenario: Delete program with confirmation
    Given a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  Scenario: Cancel program deletion
    Given I click the delete icon for a program
    When I see the confirmation dialog
    And I click Cancel
    Then the program still exists in the list

  # Negative

  Scenario: Closing the confirmation without accepting keeps the program
    Given an admin opened the delete confirmation for "DS275 Keep Me"
    When the admin dismisses the native confirmation
    Then "DS275 Keep Me" remains in the program list

  # Edge cases

  Scenario: Confirmation message names the program being deleted
    Given program "Informatique & IA - Niveau 2" exists
    When the admin clicks Delete for that program
    Then the confirmation message contains the program name
    And the admin can dismiss without deleting

# ---
# Ambiguities / gaps (resolve before automation):
# - Story AC uses literal "Test Program"; automation must use uniqueProgramName to avoid collisions.
# - Confirmation is native window.confirm, not an in-page dialog with a Cancel button — "click Cancel"
#   maps to dialog.dismiss().
# - Overlaps DS-4 / existing tests/ds4-delete-program.spec.ts; this ticket gets its own ds5- or
#   pattern-matching file annotated DS-275 (prefer ds4-delete-confirmation-ds275.spec.ts).
# UI verification summary: Playwright CLI; native confirm copy confirmed; delete/cancel flows work.
